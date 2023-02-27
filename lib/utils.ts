import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToCSV({
  rows,
  fileName = "export.csv",
  seperator = ";",
  newLine = "\n"
}: {
  rows: object[]
  fileName?: string
  seperator?: string
  newLine?: string
}) {
  if (!rows || !rows.length) {
    return
  }
  const keys = Object.keys(rows[0])
  const csvContent =
    keys.join(seperator) +
    newLine +
    rows
      .map(
        (row: { [x: string]: any }) =>
          keys
            .map((key) => (row[key] === null || row[key] === undefined ? "" : row[key])) // map key to value
            .map((cell) => (cell instanceof Date ? cell.toLocaleString() : cell.toString())) // to string
            .map((cell) => cell.replace(/"/g, '""')) // escape double quotes
            .map((cell) => `"${cell}"`) // add quotes
            .join(seperator) // join by seperator
      )
      .join(newLine) // join rows by new line

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const a = document.createElement("a")
  a.download = fileName
  a.href = URL.createObjectURL(blob)
  a.dispatchEvent(
    new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true
    })
  )
  a.remove()
}
