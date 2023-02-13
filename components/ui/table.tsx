import * as React from "react"

import { Parser } from "@json2csv/plainjs"

import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils"
import {
  Column,
  type ColumnDef,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  RowData,
  SortingState,
  Table as ReactTable,
  TableMeta,
  useReactTable,
} from "@tanstack/react-table"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { cn, downloadFile } from "@/lib/utils"
import { ClassValue } from "clsx"

const i18n = {
  search: "Search...",
  min: "Min",
  max: "Max",
  page: "Page",
  goToPage: "Go to page:",
  show: "Show",
  exportCSV: "Export .csv",
}

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    getRowStyles?: (row: Row<TData>) => ClassValue[]
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

interface TableProps<T extends object>
  extends React.TableHTMLAttributes<HTMLTableElement>,
    TableMeta<T> {
  data: T[]
  columns: ColumnDef<T>[]
  stripedRows?: boolean
  showFooter?: boolean
  showGlobalFilter?: boolean
  showColumnFilters?: boolean
  showPagination?: boolean
  pageSizes?: number[]
  allowExportCSV?: boolean
  handleClick?: (data: OnClickData<T>) => void
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
  stripedRows = false,
  showFooter = false,
  showGlobalFilter = false,
  showColumnFilters = false,
  showPagination = false,
  pageSizes = [10, 20, 30, 50],
  allowExportCSV = false,
  handleClick = () => {},
  handleDblClick = () => {},
  getRowStyles = () => [],
  className = "",
  ...props
}: TableProps<T>) => {
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      getRowStyles: getRowStyles,
    },
    debugTable: true,
  })

  React.useEffect(() => {
    table.setPageSize(
      showPagination ? pageSizes[0] ?? 10 : table.getTotalSize()
    )
  }, [])

  return (
    <div className={cn("grid grid-rows-[auto_1fr_auto] gap-2", className)}>
      <div className="flex items-end justify-between">
        {showGlobalFilter && (
          <Input
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full md:max-w-xs"
            placeholder={i18n.search}
          />
        )}
        {allowExportCSV && (
          <Button
            size="sm"
            onClick={() => {
              exportCSV(
                table.getFilteredRowModel().rows.map((row) => row.original as T)
              )
            }}
          >
            <Icons.download className="mr-2 h-4 w-4" /> {i18n.exportCSV}
          </Button>
        )}
      </div>
      <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 sm:rounded-md">
        <table
          className="w-full text-left text-sm text-slate-900 dark:text-slate-100"
          {...props}
        >
          <thead className="font bg-white text-xs font-medium uppercase dark:bg-slate-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2">
                    <div
                      className={cn(
                        "flex items-center",
                        header.column.getCanSort() &&
                          "cursor-pointer select-none"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {!header.isPlaceholder &&
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      {{
                        asc: <Icons.arrowUp className="inline h-4" />,
                        desc: <Icons.arrowDown className="inline h-4" />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
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
                      : "bg-white dark:bg-slate-800"),
                  ...table.options.meta?.getRowStyles(row)
                )}
              >
                {row.getVisibleCells().map((cell, cellIdx) => (
                  <td
                    className="px-3 py-1.5"
                    key={cell.id}
                    onClick={() =>
                      handleClick({
                        row: rowIdx,
                        cell: cellIdx,
                        data: row.original,
                      })
                    }
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
        <div className="flex items-center justify-between gap-2 text-sm">
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
              <div>{i18n.page}</div>
              <strong>
                {table.getState().pagination.pageIndex + 1}/
                {table.getPageCount()}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {i18n.goToPage}
            <Input
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                table.setPageIndex(page)
              }}
              className="h-8 w-16"
            />
            <Select
              defaultValue={String(pageSizes[0])}
              onValueChange={(value) => {
                console.log(Number(value))
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {i18n.show} {pageSize}
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

/**
 * exports a table with all the useful stuff already turned on
 */
export const FullTable = <T extends object>({
  stripedRows = true,
  showFooter = false,
  showGlobalFilter = true,
  showColumnFilters = true,
  showPagination = true,
  allowExportCSV = true,
  ...props
}: TableProps<T>) => {
  return (
    <Table
      stripedRows={stripedRows}
      showFooter={showFooter}
      showGlobalFilter={showGlobalFilter}
      showColumnFilters={showColumnFilters}
      showPagination={showPagination}
      allowExportCSV={allowExportCSV}
      {...props}
    />
  )
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
        placeholder={i18n.min}
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
        placeholder={i18n.max}
        className="h-8 w-24"
      />
    </div>
  ) : (
    <Input
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={i18n.search}
      className="h-8 w-36"
    />
  )
}

const exportCSV = <T extends object>(rowData: T[]) => {
  try {
    let csv = new Parser({ delimiter: ";" }).parse(rowData)
    downloadFile({
      data: csv,
      fileName: "export.csv",
      fileType: "text/csv",
    })
  } catch (err) {
    console.log(err)
  }
}
