"use client"

import * as React from "react"
import { ChevronsUpDown, X, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"

export interface MultiSelectOption {
  value: string
  label: string
  description?: string
  badge?: string
  disabled?: boolean
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onSelectionChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  maxDisplay?: number
  className?: string
  disabled?: boolean
  loading?: boolean
}

export function MultiSelect({
  options,
  selected,
  onSelectionChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  emptyText = "No items found",
  maxDisplay = 3,
  className,
  disabled = false,
  loading = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchValue.toLowerCase()),
    )
  }, [options, searchValue])

  const selectedOptions = React.useMemo(() => {
    return options.filter((option) => selected.includes(option.value))
  }, [options, selected])

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
    onSelectionChange(newSelected)
  }

  const handleRemove = (value: string) => {
    onSelectionChange(selected.filter((item) => item !== value))
  }

  const handleSelectAll = () => {
    if (selected.length === filteredOptions.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(filteredOptions.map((option) => option.value))
    }
  }

  const displayText = React.useMemo(() => {
    if (selected.length === 0) return placeholder
    if (selected.length <= maxDisplay) {
      return selectedOptions.map((option) => option.label).join(", ")
    }
    return `${selected.length} items selected`
  }, [selected, selectedOptions, maxDisplay, placeholder])

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 px-3 py-2 bg-transparent"
            disabled={disabled || loading}
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : selected.length <= maxDisplay ? (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(option.value)
                    }}
                  >
                    {option.label}
                    <X className="ml-1 h-3 w-3 hover:bg-muted rounded-full" />
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {selected.length} items selected
                </Badge>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {/* Select All Option */}
                {filteredOptions.length > 1 && (
                  <CommandItem onSelect={handleSelectAll} className="cursor-pointer">
                    <Checkbox
                      checked={selected.length === filteredOptions.length && filteredOptions.length > 0}
                      className="mr-2"
                    />
                    <span className="font-medium">
                      {selected.length === filteredOptions.length ? "Deselect All" : "Select All"}
                    </span>
                  </CommandItem>
                )}

                {/* Individual Options */}
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                    disabled={option.disabled}
                  >
                    <Checkbox checked={selected.includes(option.value)} className="mr-2" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={cn("truncate", option.disabled && "text-muted-foreground")}>
                          {option.label}
                        </span>
                        {option.badge && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {option.badge}
                          </Badge>
                        )}
                      </div>
                      {option.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{option.description}</p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Items Display (when collapsed) */}
      {selected.length > maxDisplay && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedOptions.slice(0, 2).map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="text-xs"
              onClick={() => handleRemove(option.value)}
            >
              {option.label}
              <X className="ml-1 h-3 w-3 hover:bg-muted rounded-full cursor-pointer" />
            </Badge>
          ))}
          {selected.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{selected.length - 2} more
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
