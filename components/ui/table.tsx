import * as React from "react"

import {
  Column,
  Table as ReactTable,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TableProps<T extends object> {
  data: T[]
  columns: ColumnDef<T>[]
  showFooter?: boolean
  showGlobalFilter?: boolean
  showColumnFilters?: boolean
  showPagination?: boolean
  stripedRows?: boolean
  handleDblClick?: (data: OnClickData<T>) => void
}

export interface OnClickData<T extends object> {
  row: number
  cell: number
  data: T
}

export const Table = <T extends object>({
  data,
  columns,
  showFooter = false,
  showGlobalFilter = false,
  showColumnFilters = false,
  showPagination = false,
  stripedRows = false,
  handleDblClick = () => {},
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
  })

  React.useEffect(() => {
    if (!showPagination) {
      // XXX TODO: check if there is a smoother solution
      // XXX TODO: also change to setPageSize = rowCount
      // XXX TODO: save rowCount to add Show All on pagination
      table.setPageSize(1000)
    }
  }, [])

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
                    {showColumnFilters && header.column.getCanFilter() && (
                      <div className="pt-1 font-normal">
                        <ColumnFilter column={header.column} table={table} />
                      </div>
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
                  {footerGroup.headers.map((footer) => (
                    <th
                      className="px-4 py-2"
                      key={footer.id}
                      colSpan={footer.colSpan}
                    >
                      {!footer.isPlaceholder &&
                        flexRender(
                          footer.column.columnDef.footer,
                          footer.getContext()
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>
      {showPagination && (
        <div className="flex items-center justify-between gap-2 py-2 text-sm">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-8"
            >
              {"<<"}
            </Button>
            <Button
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8"
            >
              {"<"}
            </Button>
            <Button
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8"
            >
              {">"}
            </Button>
            <Button
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-8"
            >
              {">>"}
            </Button>
            <span className="flex items-center gap-1">
              <div>Page</div>
              <strong>
                {table.getState().pagination.pageIndex + 1}/
                {table.getPageCount()}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            Go to page:
            <Input
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                table.setPageIndex(page)
              }}
              className="h-8 w-16"
            />
            <Select
              defaultValue="10"
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    Show {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}

declare module "@tanstack/table-core" {
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const ColumnFilter = ({
  column,
  table,
}: {
  column: Column<any, any>
  table: ReactTable<any>
}) => {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()

  return typeof firstValue === "number" ? (
    <div className="flex space-x-2">
      <Input
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ""}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
        placeholder={`Min`}
        className="h-8 w-24"
      />
      <Input
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ""}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
        placeholder={`Max`}
        className="h-8 w-24"
      />
    </div>
  ) : (
    <Input
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={`Search...`}
      className="h-8 w-36"
    />
  )
}
