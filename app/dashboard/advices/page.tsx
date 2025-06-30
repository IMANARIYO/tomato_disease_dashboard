"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { adviceApi } from "@/lib/api/advice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Eye, MessageSquare } from "lucide-react"
import { toast } from "react-hot-toast"
import type { Advice, CreateAdviceRequest } from "@/types"
import Link from "next/link"

export default function AdvicesPage() {
  const { user, hasRole } = useAuth()
  const [advices, setAdvices] = useState<Advice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAdvice, setEditingAdvice] = useState<Advice | null>(null)
  const [formData, setFormData] = useState<CreateAdviceRequest>({
    detectionId: "",
    prescription: "",
    medicineId: "",
  })

  const canCreateAdvice = hasRole(["AGRONOMIST", "ADMIN"])
  const canManageAdvice = hasRole(["ADMIN"]) || (hasRole(["AGRONOMIST"]) && user?.agronomist)

  useEffect(() => {
    fetchAdvices()
  }, [])

  const fetchAdvices = async () => {
    try {
      const response = await adviceApi.getAll(1, 50)
      setAdvices(response.data)
    } catch (error) {
      toast.error("Failed to fetch advices")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAdvice) {
        await adviceApi.update(editingAdvice.id, formData)
        toast.success("Advice updated successfully")
      } else {
        await adviceApi.createOnDetection(formData)
        toast.success("Advice created successfully")
      }
      setIsDialogOpen(false)
      setEditingAdvice(null)
      resetForm()
      fetchAdvices()
    } catch (error) {
      toast.error("Failed to save advice")
    }
  }

  const handleEdit = (advice: Advice) => {
    setEditingAdvice(advice)
    setFormData({
      detectionId: advice.detectionId || "",
      prescription: advice.prescription,
      medicineId: advice.medicineId || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this advice?")) {
      try {
        await adviceApi.delete(id)
        toast.success("Advice deleted successfully")
        fetchAdvices()
      } catch (error) {
        toast.error("Failed to delete advice")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      detectionId: "",
      prescription: "",
      medicineId: "",
    })
  }

  const getRoleBasedTitle = () => {
    if (hasRole("FARMER")) return "Expert Advice"
    if (hasRole("AGRONOMIST")) return "My Advice"
    return "All Advice"
  }

  const getRoleBasedDescription = () => {
    if (hasRole("FARMER")) return "View expert recommendations for your detections"
    if (hasRole("AGRONOMIST")) return "Manage your advice and recommendations"
    return "Manage all expert advice in the system"
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getRoleBasedTitle()}</h1>
          <p className="text-muted-foreground">{getRoleBasedDescription()}</p>
        </div>
        {canCreateAdvice && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm()
                  setEditingAdvice(null)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Advice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingAdvice ? "Edit Advice" : "Create New Advice"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="detectionId">Detection ID (Optional)</Label>
                  <Input
                    id="detectionId"
                    value={formData.detectionId}
                    onChange={(e) => setFormData({ ...formData, detectionId: e.target.value })}
                    placeholder="Enter detection ID if advice is for specific detection"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prescription">Prescription/Advice *</Label>
                  <Textarea
                    id="prescription"
                    value={formData.prescription}
                    onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                    placeholder="Enter your expert advice and recommendations"
                    rows={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicineId">Recommended Medicine (Optional)</Label>
                  <Input
                    id="medicineId"
                    value={formData.medicineId}
                    onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })}
                    placeholder="Enter medicine ID if recommending specific treatment"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingAdvice ? "Update" : "Create"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Expert Advice</span>
          </CardTitle>
          <CardDescription>
            {hasRole("FARMER")
              ? "Professional recommendations from agronomists"
              : "Expert advice and treatment recommendations"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Advice</TableHead>
                <TableHead>Agronomist</TableHead>
                <TableHead>Detection</TableHead>
                <TableHead>Medicine</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advices.map((advice) => (
                <TableRow key={advice.id}>
                  <TableCell className="max-w-xs">
                    <div className="truncate font-medium">{advice.prescription}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{advice.agronomist?.name || "Unknown"}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {advice.detection ? (
                      <Badge variant="outline">{advice.detection.disease?.name || "Detection"}</Badge>
                    ) : (
                      <span className="text-muted-foreground">General</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {advice.medicine ? (
                      <Badge variant="default">{advice.medicine.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(advice.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/advices/${advice.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {canManageAdvice && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(advice)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(advice.id)}>
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
        </CardContent>
      </Card>
    </div>
  )
}
