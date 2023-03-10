import * as React from "react"

import { ColumnDef, Row } from "@tanstack/react-table"
import { ClassValue } from "clsx"
import Head from "next/head"

import { Table, OnClickData } from "@/components/table"
import { cn } from "@/lib/utils"

export default function IndexPage() {
  type Item = {
    name: string
    price: number
    quantity: number
  }

  const cols = React.useMemo<ColumnDef<Item>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name"
      },
      {
        header: "Price",
        // custom cell styling based on value
        cell: (props) => (
          <span
            className={cn(Number(props.getValue()) < 50 ? "text-green-500" : "text-red-500")}
          >{`${props.getValue()} €`}</span>
        ),
        accessorKey: "price"
      },
      {
        header: "Quantity",
        accessorKey: "quantity"
      }
    ],
    []
  )

  const dummyData = (): Item[] => {
    const items = []
    for (let i = 0; i < 20; i++) {
      items.push({
        id: i,
        name: `Super duper long item name ${i}`,
        price: 10 * i,
        quantity: 20 - i
      })
    }
    return items
  }
  const [data, setData] = React.useState(() => [...dummyData()])

  // create a handler function that processes the clicked data
  const handleDblClick = (data: OnClickData<Item>) => {
    console.log(data)
  }

  // create a function to style the whole row based on specific column data
  const getRowStyles = (row: Row<Item>): ClassValue[] => {
    let props = []
    if (row.original.quantity < 10) {
      props.push("bg-red-800 dark:bg-red-800")
    }
    return props
  }

  return (
    <div>
      <Head>
        <title>react-table</title>
      </Head>
      <div className="flex h-screen w-screen items-center justify-center">
        <Table
          data={data}
          columns={cols}
          showColumnFilters
          handleDblClick={handleDblClick}
          getRowStyles={getRowStyles}
          allowExportCSV
          className="w-[1000px]"
        />
      </div>
    </div>
  )
}
