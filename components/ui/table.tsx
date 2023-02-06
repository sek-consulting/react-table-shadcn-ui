import * as React from "react"

import {
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

declare module "@tanstack/table-core" {
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

interface TableProps<T extends object> {
  data: T[]
  columns: ColumnDef<T>[]
  showFooter?: boolean
  showGlobalFilter?: boolean
  stripedRows?: boolean
  handleDblClick?: (data: DblClickInfo<T>) => void
}

export interface DblClickInfo<T extends object> {
  row: number
  cell: number
  data: T
}

export const Table = <T extends object>({
  data,
  columns,
  showFooter = false,
  showGlobalFilter = false,
  stripedRows = false,
  handleDblClick = (data) => {},
}: TableProps<T>) => {
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  })

  return (
    <div>
      {showGlobalFilter && (
        <div className="py-2">
          <Input
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full md:max-w-xs"
            placeholder="Search..."
          />
        </div>
      )}
      <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 sm:rounded-md">
        <table className="w-full text-left text-sm text-slate-900 dark:text-slate-100">
          <thead className="font bg-white text-xs font-medium uppercase dark:bg-slate-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2">
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIdx) => (
              <tr
                key={row.id}
                className={cn(
                  "border-t border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-700",
                  stripedRows &&
                    (rowIdx % 2 == 0
                      ? "bg-slate-50 dark:bg-slate-900"
                      : "bg-white dark:bg-slate-800")
                )}
              >
                {row.getVisibleCells().map((cell, cellIdx) => (
                  <td
                    className="px-4 py-2"
                    key={cell.id}
                    onDoubleClick={() =>
                      handleDblClick({
                        row: rowIdx,
                        cell: cellIdx,
                        data: row.original,
                      })
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {showFooter && (
            <tfoot className="border-t border-slate-300 bg-white text-xs font-medium uppercase dark:border-slate-700  dark:text-gray-400">
              {table.getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((header) => (
                    <th
                      className="px-4 py-2"
                      key={header.id}
                      colSpan={header.colSpan}
                    >
                      {!header.isPlaceholder &&
                        flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>

      <div className="flex items-center gap-2 py-2">
        <Button
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </Button>
        <Button
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </Button>
        <Button
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </Button>
        <Button
          size="sm"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </Button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="w-16 rounded border p-1"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <pre>{JSON.stringify(table.getState(), null, 2)}</pre>
    </div>
  )
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}
