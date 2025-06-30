"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { diseaseApi } from "@/lib/api/disease"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Edit, Trash2, Eye, AlertTriangle } from "lucide-react"
import { toast } from "react-hot-toast"
import type { Disease, CreateDiseaseRequest } from "@/types"
import Link from "next/link"
import { AuthGuard } from "@/components/layout/auth-guard"

export default function DiseasesPage() {
  const { hasRole } = useAuth()
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null)
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [formData, setFormData] = useState<CreateDiseaseRequest>({
    name: "",
    description: "",
    scientificName: "",
    symptoms: "",
    severity: "",
    prevention: "",
    treatment: "",
  })

  const canManage = hasRole(["ADMIN"])

  useEffect(() => {
    fetchDiseases()
  }, [currentPage])

  const fetchDiseases = async () => {
    setIsLoading(true)
    try {
      const response = await diseaseApi.getAll(currentPage, 10)
      setDiseases(response.data)
      setTotalPages(response.totalPages)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch diseases")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingDisease) {
        await diseaseApi.update(editingDisease.id, formData)
        toast.success("Disease updated successfully")
      } else {
        await diseaseApi.create(formData)
        toast.success("Disease created successfully")
      }
      setIsSheetOpen(false)
      setEditingDisease(null)
      resetForm()
      fetchDiseases()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save disease")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (disease: Disease) => {
    setEditingDisease(disease)
    setFormData({
      name: disease.name,
      description: disease.description || "",
      scientificName: disease.scientificName || "",
      symptoms: disease.symptoms || "",
      severity: disease.severity || "",
      prevention: disease.prevention || "",
      treatment: disease.treatment || "",
    })
    setIsSheetOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedDisease) return

    try {
      await diseaseApi.delete(selectedDisease.id)
      toast.success("Disease deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedDisease(null)
      fetchDiseases()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete disease")
    }
  }

  const openDeleteDialog = (disease: Disease) => {
    setSelectedDisease(disease)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      scientificName: "",
      symptoms: "",
      severity: "",
      prevention: "",
      treatment: "",
    })
  }

  const openCreateSheet = () => {
    resetForm()
    setEditingDisease(null)
    setIsSheetOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <AuthGuard requiredRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Diseases</h1>
            <p className="text-muted-foreground">Manage tomato disease information database</p>
          </div>
          {canManage && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button onClick={openCreateSheet}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Disease
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[600px] sm:max-w-[600px]">
                <SheetHeader>
                  <SheetTitle>{editingDisease ? "Edit Disease" : "Add New Disease"}</SheetTitle>
                  <SheetDescription>
                    {editingDisease ? "Update disease information" : "Add a new disease to the database"}
                  </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Early Blight"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scientificName">Scientific Name</Label>
                      <Input
                        id="scientificName"
                        value={formData.scientificName}
                        onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                        placeholder="e.g., Alternaria solani"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the disease"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symptoms">Symptoms</Label>
                    <Textarea
                      id="symptoms"
                      value={formData.symptoms}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                      placeholder="Describe the visible symptoms"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity Level</Label>
                      <Input
                        id="severity"
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        placeholder="e.g., High, Medium, Low"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prevention">Prevention Methods</Label>
                    <Textarea
                      id="prevention"
                      value={formData.prevention}
                      onChange={(e) => setFormData({ ...formData, prevention: e.target.value })}
                      placeholder="How to prevent this disease"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="treatment">Treatment Options</Label>
                    <Textarea
                      id="treatment"
                      value={formData.treatment}
                      onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                      placeholder="Treatment and management strategies"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsSheetOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : editingDisease ? "Update Disease" : "Create Disease"}
                    </Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Disease Database</CardTitle>
            <CardDescription>Comprehensive information about tomato diseases</CardDescription>
          </CardHeader>
          <CardContent>
            {diseases.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-12 w-12 text-muted-foreground mx-auto mb-4">🦠</div>
                <h3 className="text-lg font-semibold mb-2">No diseases found</h3>
                <p className="text-muted-foreground">
                  {canManage ? "Add your first disease to get started" : "No diseases have been added yet"}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Scientific Name</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Detections</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diseases.map((disease) => (
                      <TableRow key={disease.id}>
                        <TableCell className="font-medium">{disease.name}</TableCell>
                        <TableCell className="text-muted-foreground">{disease.scientificName || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              disease.severity?.toLowerCase() === "high"
                                ? "destructive"
                                : disease.severity?.toLowerCase() === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {disease.severity || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>{disease.detections?.length || 0}</TableCell>
                        <TableCell>{new Date(disease.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/diseases/${disease.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {canManage && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(disease)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(disease)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Showing {diseases.length} diseases</p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span>Confirm Deletion</span>
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedDisease?.name}"? This action cannot be undone and will affect
                all related detections and medicines.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Disease
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
