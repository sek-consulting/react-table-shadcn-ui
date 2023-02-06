import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

import { cn } from "@/lib/utils"

interface TableProps<T extends object> {
  data: T[]
  columns: ColumnDef<T>[]
  showFooter?: boolean
  stripedRows?: boolean
}

export const Table = <T extends object>({
  data,
  columns,
  showFooter = false,
  stripedRows = false,
}: TableProps<T>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 sm:rounded-md">
      <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
        <thead className="font bg-white text-xs font-medium uppercase text-gray-700 dark:bg-slate-800 dark:text-gray-400">
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
          {table.getRowModel().rows.map((row, i) => (
            <tr
              key={row.id}
              className={cn(
                "border-t border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-700",
                stripedRows &&
                  (i % 2 == 0
                    ? "bg-slate-50 dark:bg-slate-900"
                    : "bg-white dark:bg-slate-800")
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td className="px-4 py-2" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {showFooter && (
          <tfoot className="border-t border-slate-300 bg-white text-xs font-medium uppercase text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-400">
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
  )
}
