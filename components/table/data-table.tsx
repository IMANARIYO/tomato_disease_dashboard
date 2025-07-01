"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  getFilteredRowModel
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

import { Search } from "lucide-react";

import { DataTablePagination } from "./DataTablePagination";
import { DataTableViewOptions } from "./DataTableViewOptions";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumns?: string[]; // Optional list of columns to filter by
  filterPlaceholder?: string; // Optional custom placeholder text
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumns, // If undefined, will filter across all filterable columns
  filterPlaceholder = "Search..."
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const safeValue = String(row.getValue(columnId) ?? "").toLowerCase();
      return safeValue.includes(String(filterValue).toLowerCase());
    },
    state: {
      sorting,
      columnFilters,
      rowSelection,
      columnVisibility,
      globalFilter
    }
  });

  // Function to handle filtering across multiple columns
  const handleFilterChange = (value: string) => {
    setGlobalFilter(value);

    // If specific columns are provided, set column filters for each
    if (filterColumns && filterColumns.length > 0) {
      // Clear existing column filters first
      table.getAllColumns().forEach((column) => {
        if (column.getCanFilter()) {
          column.setFilterValue(undefined);
        }
      });

      // Set filters for specified columns
      filterColumns.forEach((columnId) => {
        const column = table.getColumn(columnId);
        if (column && column.getCanFilter()) {
          column.setFilterValue(value);
        }
      });
    }
  };

  return (
    <div className="w-full overflow-x-auto ">
      <div className="flex items-center justify-between py-4 gap-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={filterPlaceholder}
            value={globalFilter ?? ""}
            onChange={(event) => handleFilterChange(event.target.value)}
            className="pl-8 max-w-sm"
          />
        </div>
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}