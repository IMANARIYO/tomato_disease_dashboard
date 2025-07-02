"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth/auth-context"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye, AlertTriangle, MessageSquare, LinkIcon, MoreHorizontal } from "lucide-react"
import { toast } from "react-hot-toast"
import type { Disease, CreateDiseaseRequest, CreateAdviceRequest, CreateMedicineRequest } from "@/types"
import Link from "next/link"
import { AuthGuard } from "@/components/layout/auth-guard"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { medicineApi } from "@/lib/api/medicine"
import { dynamicCruds } from "@/lib/hooks/dynamicCruds"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader"
import { MedicineMultiSelect } from "../medicines/components/medicine-multi-select"
import { DataTable } from "@/components/table/data-table"


export default function DiseasesPage() {
  const { hasRole } = useAuth()
  const { createData, updateData, deleteData } = dynamicCruds<CreateDiseaseRequest>()
  const { fetchData } = dynamicCruds<Disease>()

  // Fetch diseases using React Query
  const { data: diseases = [], isLoading, error } = fetchData("/diseases", "diseases")
  const createMutation = createData("/diseases", "diseases")
  const updateMutation = updateData("/diseases", "diseases")
  const deleteMutation = deleteData("/diseases", "diseases")

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isMedicineSheetOpen, setIsMedicineSheetOpen] = useState(false)
  const [isAdviceSheetOpen, setIsAdviceSheetOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null)
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null)
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([])
  const [formSelectedMedicines, setFormSelectedMedicines] = useState<string[]>([])

  const [formData, setFormData] = useState<CreateDiseaseRequest>({
    name: "",
    description: "",
    scientificName: "",
    symptoms: "",
    severity: "Low",
    prevention: "",
    medicines: [],
    treatment: "",
  })

  const [adviceFormData, setAdviceFormData] = useState<CreateAdviceRequest>({
    prescription: "",
    medicineId: "",
  })

  const canManage = hasRole(["ADMIN","AGRONOMIST"])
  const canCreateAdvice = hasRole(["AGRONOMIST", "ADMIN"])

  const [isCreateMedicineSheetOpen, setIsCreateMedicineSheetOpen] = useState(false)
  const [medicineFormData, setMedicineFormData] = useState<CreateMedicineRequest>({
    name: "",
    description: "",
    usageInstructions: [],
    diseases: [],
  })
  const [instructionInput, setInstructionInput] = useState("")

  const handleLinkMedicines = async () => {
    if (!selectedDisease) {
      toast.error("No disease selected")
      return
    }

    try {
      const {
        id,
        name,
        description,
        scientificName,
        symptoms,
        severity,
        prevention,
        treatment,
      } = selectedDisease

      await updateMutation.mutateAsync({
        id: selectedDisease.id,
        data: {
          name,
          description,
          scientificName,
          symptoms,
          severity,
          prevention,
          treatment,
          medicines: selectedMedicines,
        },
      })
      toast.success("Medicines linked to disease successfully")
      setIsMedicineSheetOpen(false)
      setSelectedMedicines([])
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to link medicines")
    }
  }

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dataToSubmit = {
        ...medicineFormData,
        usageInstructions: instructionInput.split("\n").filter((line) => line.trim() !== ""),
        diseaseIds: selectedDisease ? [selectedDisease.id] : [],
      }

      await medicineApi.create(dataToSubmit)
      toast.success("Medicine created and linked successfully")
      setIsCreateMedicineSheetOpen(false)
      resetMedicineForm()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create medicine")
    }
  }

  const resetMedicineForm = () => {
    setMedicineFormData({
      name: "",
      description: "",
      usageInstructions: [],
      diseases: [],
    })
    setInstructionInput("")
  }

  const openCreateMedicineSheet = (disease: Disease) => {
    setSelectedDisease(disease)
    resetMedicineForm()
    setIsCreateMedicineSheetOpen(true)
  }

  // Define columns for the DataTable
  const columns: ColumnDef<Disease>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
      },
      {
        accessorKey: "scientificName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Scientific Name" />,
        cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("scientificName") || "N/A"}</div>,
      },
      {
        accessorKey: "severity",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Severity" />,
        cell: ({ row }) => {
          const severity = row.getValue("severity") as string
          return (
            <Badge
              variant={
                severity?.toLowerCase() === "critical" || severity?.toLowerCase() === "high"
                  ? "destructive"
                  : severity?.toLowerCase() === "medium"
                    ? "default"
                    : "secondary"
              }
            >
              {severity || "Unknown"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "medicines",
        header: "Medicines",
        cell: ({ row }) => {
          const disease = row.original
          return (
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{disease.medicines?.length || 0} linked</Badge>
              {canManage && (
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openMedicineSheet(disease)} title="Manage Medicines">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "detections",
        header: "Detections",
        cell: ({ row }) => {
          const disease = row.original
          return <div>{disease.detections?.length || 0}</div>
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
          const disease = row.original
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
                  <Link href={`/dashboard/diseases/${disease.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {canCreateAdvice && (
                  <DropdownMenuItem onClick={() => openAdviceSheet(disease)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Create Advice
                  </DropdownMenuItem>
                )}
                {canManage && (
                  <>
                    <DropdownMenuItem onClick={() => handleEdit(disease)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openDeleteDialog(disease)}>
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
      const submitData = {
        ...formData,
        medicines: formSelectedMedicines,
      }

      if (editingDisease) {
        await updateMutation.mutateAsync({
          id: editingDisease.id,
          data: submitData,
        })
        toast.success("Disease updated successfully")
      } else {
        await createMutation.mutateAsync(submitData)
        toast.success("Disease created successfully")
      }
      setIsSheetOpen(false)
      setEditingDisease(null)
      resetForm()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save disease")
    }
  }

  const handleEdit = (disease: Disease) => {
    setEditingDisease(disease)
    const medicines = disease.medicines?.map((m) => m.id) || []
    setFormData({
      name: disease.name,
      description: disease.description || "",
      scientificName: disease.scientificName || "",
      symptoms: disease.symptoms || "",
      severity: disease.severity || "Low",
      prevention: disease.prevention || "",
      treatment: disease.treatment || "",
    })
    setFormSelectedMedicines(medicines)
    setIsSheetOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedDisease) return
    try {
      await deleteMutation.mutateAsync(selectedDisease.id)
      toast.success("Disease deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedDisease(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete disease")
    }
  }

  const openDeleteDialog = (disease: Disease) => {
    setSelectedDisease(disease)
    setIsDeleteDialogOpen(true)
  }

  const openMedicineSheet = (disease: Disease) => {
    setSelectedDisease(disease)
    setSelectedMedicines(disease.medicines?.map((m) => m.id) || [])
    setIsMedicineSheetOpen(true)
  }

  const openAdviceSheet = (disease: Disease) => {
    setSelectedDisease(disease)
    setAdviceFormData({ prescription: "", medicineId: "" })
    setIsAdviceSheetOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      scientificName: "",
      symptoms: "",
      severity: "Low",
      prevention: "",
      treatment: "",
    })
    setFormSelectedMedicines([])
  }

  const openCreateSheet = () => {
    resetForm()
    setEditingDisease(null)
    setIsSheetOpen(true)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">Error loading diseases</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requiredRoles={["ADMIN", "AGRONOMIST", "FARMER"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Diseases</h1>
            <p className="text-muted-foreground">Manage tomato disease information, medicines, and advice</p>
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
                        disabled={createMutation.isPending || updateMutation.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scientificName">Scientific Name</Label>
                      <Input
                        id="scientificName"
                        value={formData.scientificName}
                        onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                        placeholder="e.g., Alternaria solani"
                        disabled={createMutation.isPending || updateMutation.isPending}
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
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symptoms">Symptoms</Label>
                    <Textarea
                      id="symptoms"
                      value={formData.symptoms}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                      placeholder="Describe the visible symptoms"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity Level</Label>
                      <Select
                        value={formData.severity}
                        onValueChange={(value) => setFormData({ ...formData, severity: value })}
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prevention">Prevention Methods</Label>
                    <Textarea
                      id="prevention"
                      value={formData.prevention}
                      onChange={(e) => setFormData({ ...formData, prevention: e.target.value })}
                      placeholder="How to prevent this disease"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="treatment">Treatment Options</Label>
                    <Textarea
                      id="treatment"
                      value={formData.treatment}
                      onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                      placeholder="Treatment and management strategies"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Associated Medicines</Label>
                    <MedicineMultiSelect
                      selectedMedicines={formSelectedMedicines}
                      onSelectionChange={setFormSelectedMedicines}
                      onCreateNew={() => {
                        // Optionally open create medicine sheet
                        toast("Create medicine functionality can be added here")
                      }}
                      placeholder="Select medicines for this disease..."
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                    <p className="text-sm text-muted-foreground">
                      Select medicines that are effective for treating this disease
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
                        : editingDisease
                          ? "Update Disease"
                          : "Create Disease"}
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
            <CardDescription>
              Comprehensive information about tomato diseases with advanced filtering and sorting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={diseases}
              filterColumns={["name", "scientificName", "severity"]}
              filterPlaceholder="Search diseases..."
            />
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
                all related detections, medicines, and advice.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Deleting..." : "Delete Disease"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Medicine Management Sheet */}
        <Sheet open={isMedicineSheetOpen} onOpenChange={setIsMedicineSheetOpen}>
          <SheetContent className="w-[600px] sm:max-w-[600px]">
            <SheetHeader>
              <SheetTitle className="flex items-center space-x-2">
                <LinkIcon className="h-5 w-5" />
                <span>Manage Medicines for {selectedDisease?.name}</span>
              </SheetTitle>
              <SheetDescription>Select medicines that are effective for treating this disease</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <MedicineMultiSelect
                selectedMedicines={selectedMedicines}
                onSelectionChange={setSelectedMedicines}
                onCreateNew={() => openCreateMedicineSheet(selectedDisease!)}
                placeholder="Select medicines to link..."
              />

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsMedicineSheetOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleLinkMedicines}>Link Selected Medicines</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Create New Medicine Sheet */}
        <Sheet open={isCreateMedicineSheetOpen} onOpenChange={setIsCreateMedicineSheetOpen}>
          <SheetContent className="w-[600px] sm:max-w-[600px]">
            <SheetHeader>
              <SheetTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create New Medicine for {selectedDisease?.name}</span>
              </SheetTitle>
              <SheetDescription>Create a new medicine and automatically link it to this disease</SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreateMedicine} className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="medicineName">Medicine Name *</Label>
                <Input
                  id="medicineName"
                  value={medicineFormData.name}
                  onChange={(e) => setMedicineFormData({ ...medicineFormData, name: e.target.value })}
                  placeholder="e.g., Copper Fungicide Pro"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicineDescription">Description</Label>
                <Textarea
                  id="medicineDescription"
                  value={medicineFormData.description}
                  onChange={(e) => setMedicineFormData({ ...medicineFormData, description: e.target.value })}
                  placeholder="Brief description of the medicine and its uses"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicineInstructions">Usage Instructions *</Label>
                <Textarea
                  id="medicineInstructions"
                  value={instructionInput}
                  onChange={(e) => setInstructionInput(e.target.value)}
                  placeholder="Enter each instruction on a new line:&#10;1. Mix 2ml per liter of water&#10;2. Spray on affected leaves&#10;3. Repeat every 7 days&#10;4. Wear protective equipment"
                  rows={6}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Enter each instruction on a new line. They will be displayed as numbered steps.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <LinkIcon className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-600">Auto-linking</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This medicine will be automatically linked to <strong>{selectedDisease?.name}</strong> after creation.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateMedicineSheetOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create & Link Medicine</Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </AuthGuard>
  )
}
