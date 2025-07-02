"use client"

import { useState, useEffect } from "react"
import { MultiSelect, type MultiSelectOption } from "./multi-select"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import { toast } from "react-hot-toast"

interface EntitySelectorProps<T> {
  fetchData: () => Promise<T[]>
  mapToOptions: (items: T[]) => MultiSelectOption[]
  selected: string[]
  onSelectionChange: (selected: string[]) => void
  onCreateNew?: () => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  showCreateButton?: boolean
  showRefreshButton?: boolean
  className?: string
  disabled?: boolean
}

export function EntitySelector<T>({
  fetchData,
  mapToOptions,
  selected,
  onSelectionChange,
  onCreateNew,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  emptyText = "No items found",
  showCreateButton = true,
  showRefreshButton = true,
  className,
  disabled = false,
}: EntitySelectorProps<T>) {
  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await fetchData()
      setItems(data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch data")
    } finally {
      setIsLoading(false)
    }
  }

  const options = mapToOptions(items)

  return (
    <div className={className}>
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex-1">
          <MultiSelect
            options={options}
            selected={selected}
            onSelectionChange={onSelectionChange}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
            emptyText={emptyText}
            loading={isLoading}
            disabled={disabled}
          />
        </div>
        {showRefreshButton && (
          <Button variant="outline" size="icon" onClick={loadData} disabled={isLoading} title="Refresh data">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        )}
        {showCreateButton && onCreateNew && (
          <Button variant="outline" size="icon" onClick={onCreateNew} title="Create new">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {selected.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selected.length} item{selected.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  )
}
