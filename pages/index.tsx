import Head from "next/head"
import { Layout } from "@/components/layout"
import { DblClickInfo, Table } from "@/components/ui/table"
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
      },
    ],
    []
  )

  const dummyData = (): Item[] => {
    const items = []
    for (let i = 0; i < 100; i++) {
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
  const handleDblClick = (data: DblClickInfo<Item>) => {
    console.log(data)
  }

  return (
    <Layout>
      <Head>
        <title>react-table</title>
      </Head>
      <div className="flex h-screen w-screen justify-center">
        <Table
          data={dummyData()}
          columns={cols}
          stripedRows
          showGlobalFilter
          handleDblClick={handleDblClick}
        />
      </div>
    </Layout>
  )
}
