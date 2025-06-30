"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { medicineApi } from "@/lib/api/medicine"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Edit, Trash2, Eye, AlertTriangle } from "lucide-react"
import { toast } from "react-hot-toast"
import type { Medicine, CreateMedicineRequest } from "@/types"
import Link from "next/link"
import { AuthGuard } from "@/components/layout/auth-guard"

export default function MedicinesPage() {
  const { hasRole } = useAuth()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [formData, setFormData] = useState<CreateMedicineRequest>({
    name: "",
    description: "",
    usageInstructions: [],
  })
  const [instructionInput, setInstructionInput] = useState("")

  const canManage = hasRole(["AGRONOMIST", "ADMIN"])

  useEffect(() => {
    fetchMedicines()
  }, [currentPage])

  const fetchMedicines = async () => {
    setIsLoading(true)
    try {
      const response = await medicineApi.getAll(currentPage, 10)
      setMedicines(response.data)
      setTotalPages(response.totalPages)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch medicines")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const dataToSubmit = {
        ...formData,
        usageInstructions: instructionInput.split("\n").filter((line) => line.trim() !== ""),
      }

      if (editingMedicine) {
        await medicineApi.update(editingMedicine.id, dataToSubmit)
        toast.success("Medicine updated successfully")
      } else {
        await medicineApi.create(dataToSubmit)
        toast.success("Medicine created successfully")
      }
      setIsSheetOpen(false)
      setEditingMedicine(null)
      resetForm()
      fetchMedicines()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save medicine")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine)
    setFormData({
      name: medicine.name,
      description: medicine.description || "",
      usageInstructions: medicine.usageInstructions,
    })
    setInstructionInput(medicine.usageInstructions.join("\n"))
    setIsSheetOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedMedicine) return

    try {
      await medicineApi.delete(selectedMedicine.id)
      toast.success("Medicine deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedMedicine(null)
      fetchMedicines()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete medicine")
    }
  }

  const openDeleteDialog = (medicine: Medicine) => {
    setSelectedMedicine(medicine)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      usageInstructions: [],
    })
    setInstructionInput("")
  }

  const openCreateSheet = () => {
    resetForm()
    setEditingMedicine(null)
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
    <AuthGuard requiredRoles={["AGRONOMIST", "ADMIN", "FARMER"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medicines</h1>
            <p className="text-muted-foreground">Manage treatment medications and prescriptions</p>
          </div>
          {canManage && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button onClick={openCreateSheet}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medicine
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[600px] sm:max-w-[600px]">
                <SheetHeader>
                  <SheetTitle>{editingMedicine ? "Edit Medicine" : "Add New Medicine"}</SheetTitle>
                  <SheetDescription>
                    {editingMedicine ? "Update medicine information" : "Add a new medicine to the database"}
                  </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Medicine Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Copper Fungicide"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the medicine and its uses"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Usage Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={instructionInput}
                      onChange={(e) => setInstructionInput(e.target.value)}
                      placeholder="Enter each instruction on a new line:&#10;1. Mix 2ml per liter of water&#10;2. Spray on affected leaves&#10;3. Repeat every 7 days"
                      rows={6}
                      disabled={isSubmitting}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter each instruction on a new line. They will be displayed as numbered steps.
                    </p>
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
                      {isSubmitting ? "Saving..." : editingMedicine ? "Update Medicine" : "Create Medicine"}
                    </Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Medicine Database</CardTitle>
            <CardDescription>Available treatments and medications for tomato diseases</CardDescription>
          </CardHeader>
          <CardContent>
            {medicines.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-12 w-12 text-muted-foreground mx-auto mb-4">💊</div>
                <h3 className="text-lg font-semibold mb-2">No medicines found</h3>
                <p className="text-muted-foreground">
                  {canManage ? "Add your first medicine to get started" : "No medicines have been added yet"}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Instructions</TableHead>
                      <TableHead>Diseases</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicines.map((medicine) => (
                      <TableRow key={medicine.id}>
                        <TableCell className="font-medium">{medicine.name}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {medicine.description || "N/A"}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {medicine.usageInstructions.length} step{medicine.usageInstructions.length !== 1 ? "s" : ""}
                          </span>
                        </TableCell>
                        <TableCell>{medicine.diseases?.length || 0}</TableCell>
                        <TableCell>{new Date(medicine.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/medicines/${medicine.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {canManage && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(medicine)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(medicine)}>
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
                  <p className="text-sm text-muted-foreground">Showing {medicines.length} medicines</p>
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
                Are you sure you want to delete "{selectedMedicine?.name}"? This action cannot be undone and will affect
                all related advice and prescriptions.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Medicine
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
