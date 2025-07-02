"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth/auth-context"

import { adviceApi } from "@/lib/api/advice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Edit, Trash2, Eye, AlertTriangle, MessageSquare, MoreHorizontal, Pill } from "lucide-react"
import { toast } from "react-hot-toast"
import type { Medicine, CreateMedicineRequest, CreateAdviceRequest, MedicineRequest } from "@/types"
import Link from "next/link"
import { AuthGuard } from "@/components/layout/auth-guard"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { dynamicCruds } from "@/lib/hooks/dynamicCruds"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader"
import { DataTable } from "@/components/table/data-table"

export default function MedicinesPage() {
  const { hasRole } = useAuth()
  const { fetchData } = dynamicCruds<Medicine>()
  const {createData, updateData, deleteData } = dynamicCruds<MedicineRequest>()

  // Fetch medicines using React Query
  const { data: medicines = [], isLoading, error } = fetchData("/medecines", "medicines")
  const createMutation = createData("/medecines", "medicines")
  const updateMutation = updateData("/medecines", "medicines")
  const deleteMutation = deleteData("/medecines", "medicines")

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isAdviceSheetOpen, setIsAdviceSheetOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [instructionInput, setInstructionInput] = useState("")

  const [formData, setFormData] = useState<CreateMedicineRequest>({
    name: "",
    description: "",
    usageInstructions: [],
    diseases: [],
  })

  const [adviceFormData, setAdviceFormData] = useState<CreateAdviceRequest>({
    prescription: "",
    medicineId: "",
  })

  const canManage = hasRole(["AGRONOMIST", "ADMIN"])
  const canCreateAdvice = hasRole(["AGRONOMIST", "ADMIN"])

  // Define columns for the DataTable
  const columns: ColumnDef<Medicine>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Pill className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.getValue("name")}</span>
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
        cell: ({ row }) => {
          const description = row.getValue("description") as string
          return <div className="max-w-xs truncate text-muted-foreground">{description || "No description"}</div>
        },
      },
      {
        accessorKey: "usageInstructions",
        header: "Instructions",
        cell: ({ row }) => {
          const medicine = row.original
          const instructionCount = medicine.usageInstructions?.length || 0
          return (
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {instructionCount} step{instructionCount !== 1 ? "s" : ""}
              </Badge>
              {instructionCount > 0 && (
                <div className="max-w-xs">
                  <div className="text-xs text-muted-foreground truncate">
                    {medicine.usageInstructions[0]}
                    {instructionCount > 1 && "..."}
                  </div>
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "diseases",
        header: "Disease Count",
        cell: ({ row }) => {
          const medicine = row.original
          const diseaseCount = medicine.diseases?.length || 0
          return (
            <div className="flex items-center space-x-2">
              <Badge variant={diseaseCount > 0 ? "default" : "secondary"}>
                {diseaseCount} disease{diseaseCount !== 1 ? "s" : ""}
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
        cell: ({ row }) => {
          return new Date(row.getValue("createdAt")).toLocaleDateString()
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const medicine = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/medicines/${medicine.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {canCreateAdvice && (
                  <DropdownMenuItem onClick={() => openAdviceSheet(medicine)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Create Advice
                  </DropdownMenuItem>
                )}
                {canManage && (
                  <>
                    <DropdownMenuItem onClick={() => handleEdit(medicine)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openDeleteDialog(medicine)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [canManage, canCreateAdvice],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dataToSubmit = {
        ...formData,
        usageInstructions: instructionInput.split("\n").filter((line) => line.trim() !== ""),
      }

      if (editingMedicine) {
        await updateMutation.mutateAsync({
          id: editingMedicine.id,
          data: {
            ...dataToSubmit,
            // Use diseaseIds instead of diseases for update
            diseases: formData.diseases || [],
          },
        })
        toast.success("Medicine updated successfully")
      } else {
        await createMutation.mutateAsync({
          ...dataToSubmit,
          // Use diseaseIds instead of diseases for create
          diseases: formData.diseases || [],
        })
        toast.success("Medicine created successfully")
      }
      setIsSheetOpen(false)
      setEditingMedicine(null)
      resetForm()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save medicine")
    }
  }

  const handleAdviceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMedicine) return

    try {
      await adviceApi.createOnMedicine({
        ...adviceFormData,
        medicineId: selectedMedicine.id,
      })
      toast.success("Advice created successfully")
      setIsAdviceSheetOpen(false)
      setAdviceFormData({ prescription: "", medicineId: "" })
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create advice")
    }
  }

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine)
    setFormData({
      name: medicine.name,
      description: medicine.description || "",
      usageInstructions: medicine.usageInstructions,
      diseases: medicine.diseases?.map((d) => d.id) || [],
    })
    setInstructionInput(medicine.usageInstructions.join("\n"))
    setIsSheetOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedMedicine) return
    try {
      await deleteMutation.mutateAsync(selectedMedicine.id)
      toast.success("Medicine deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedMedicine(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete medicine")
    }
  }

  const openDeleteDialog = (medicine: Medicine) => {
    setSelectedMedicine(medicine)
    setIsDeleteDialogOpen(true)
  }

  const openAdviceSheet = (medicine: Medicine) => {
    setSelectedMedicine(medicine)
    setAdviceFormData({ prescription: "", medicineId: medicine.id })
    setIsAdviceSheetOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      usageInstructions: [],
      diseases: [],
    })
    setInstructionInput("")
  }

  const openCreateSheet = () => {
    resetForm()
    setEditingMedicine(null)
    setIsSheetOpen(true)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">Error loading medicines</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    )
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
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the medicine and its uses"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Usage Instructions *</Label>
                    <Textarea
                      id="instructions"
                      value={instructionInput}
                      onChange={(e) => setInstructionInput(e.target.value)}
                      placeholder="Enter each instruction on a new line:&#10;1. Mix 2ml per liter of water&#10;2. Spray on affected leaves&#10;3. Repeat every 7 days"
                      rows={6}
                      disabled={createMutation.isPending || updateMutation.isPending}
                      required
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
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : editingMedicine
                          ? "Update Medicine"
                          : "Create Medicine"}
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
            <CardDescription>
              Available treatments and medications for tomato diseases with advanced filtering and sorting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={medicines}
              filterColumns={["name", "description"]}
              filterPlaceholder="Search medicines..."
            />
          </CardContent>
        </Card>

        {/* Create Advice Sheet */}
        <Sheet open={isAdviceSheetOpen} onOpenChange={setIsAdviceSheetOpen}>
          <SheetContent className="w-[600px] sm:max-w-[600px]">
            <SheetHeader>
              <SheetTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Create Advice for {selectedMedicine?.name}</span>
              </SheetTitle>
              <SheetDescription>Provide expert advice and recommendations for this medicine</SheetDescription>
            </SheetHeader>
            <form onSubmit={handleAdviceSubmit} className="space-y-6 mt-6">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Pill className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-600">Medicine Information</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Creating advice for: <strong>{selectedMedicine?.name}</strong>
                </p>
                {selectedMedicine?.description && (
                  <p className="text-xs text-muted-foreground mt-1">{selectedMedicine.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prescription">Advice & Prescription *</Label>
                <Textarea
                  id="prescription"
                  value={adviceFormData.prescription}
                  onChange={(e) => setAdviceFormData({ ...adviceFormData, prescription: e.target.value })}
                  placeholder="Provide detailed advice for using this medicine..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAdviceSheetOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Advice</Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>

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
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Deleting..." : "Delete Medicine"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
