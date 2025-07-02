"use client"

import { useState, useEffect } from "react"
import { medicineApi } from "@/lib/api/medicine"
import { MultiSelect, type MultiSelectOption } from "@/components/multi-select"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import { toast } from "react-hot-toast"
import type { Medicine } from "@/types"

interface MedicineMultiSelectProps {
  selectedMedicines: string[]
  onSelectionChange: (medicines: string[]) => void
  onCreateNew?: () => void
  showCreateButton?: boolean
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MedicineMultiSelect({
  selectedMedicines,
  onSelectionChange,
  onCreateNew,
  showCreateButton = true,
  placeholder = "Select medicines...",
  className,
  disabled = false,
}: MedicineMultiSelectProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    setIsLoading(true)
    try {
      const response = await medicineApi.getAll(1, 100)
      setMedicines(response.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch medicines")
    } finally {
      setIsLoading(false)
    }
  }

  const medicineOptions: MultiSelectOption[] = medicines.map((medicine) => ({
    value: medicine.id,
    label: medicine.name,
    description: medicine.description,
    badge: `${medicine.usageInstructions.length} steps`,
  }))

  return (
    <div className={className}>
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex-1">
          <MultiSelect
            options={medicineOptions}
            selected={selectedMedicines}
            onSelectionChange={onSelectionChange}
            placeholder={placeholder}
            searchPlaceholder="Search medicines..."
            emptyText="No medicines found"
            loading={isLoading}
            disabled={disabled}
          />
        </div>
        <Button variant="outline" size="icon" onClick={fetchMedicines} disabled={isLoading} title="Refresh medicines">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
        {showCreateButton && onCreateNew && (
          <Button variant="outline" size="icon" onClick={onCreateNew} title="Create new medicine">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {selectedMedicines.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedMedicines.length} medicine{selectedMedicines.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  )
}
