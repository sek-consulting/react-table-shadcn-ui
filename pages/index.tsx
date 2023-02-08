import Head from "next/head"
import { OnClickData, Table } from "@/components/ui/table"
import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"

export default function IndexPage() {
  type Item = {
    name: string
    price: number
    quantity: number
  }

  const cols = useMemo<ColumnDef<Item>[]>(
    () => [
      {
        header: "Name",
        cell: (row) => row.renderValue(),
        accessorKey: "name",
      },
      {
        header: "Price",
        cell: (row) => row.renderValue(),
        accessorKey: "price",
      },
      {
        header: "Quantity",
        cell: (row) => row.renderValue(),
        accessorKey: "quantity",
        footer: "total",
        enableColumnFilter: false,
      },
    ],
    []
  )

  const dummyData = (): Item[] => {
    const items = []
    for (let i = 0; i < 20; i++) {
      items.push({
        id: i,
        name: `Super duper long item name ${i}`,
        price: 100,
        quantity: 1,
      })
    }
    return items
  }

  // create a handler function that processes the clicked data
  const handleDblClick = (data: OnClickData<Item>) => {
    console.log(data)
  }

  return (
    <div>
      <Head>
        <title>react-table</title>
      </Head>
      <div className="flex h-screen w-screen items-center justify-center">
        <Table
          data={dummyData()}
          columns={cols}
          stripedRows
          showGlobalFilter
          showColumnFilters
          showPagination
          handleDblClick={handleDblClick}
        />
      </div>
    </div>
  )
}
