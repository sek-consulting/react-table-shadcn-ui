import Head from "next/head"
import { Layout } from "@/components/layout"
import { Table } from "@/components/ui/table"
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
    for (let i = 0; i < 10; i++) {
      items.push({
        id: i,
        name: `Item ${i}`,
        price: 100,
        quantity: 1,
      })
    }
    return items
  }

  return (
    <Layout>
      <Head>
        <title>react-table</title>
      </Head>
      <div className="flex h-screen w-screen items-center justify-center">
        <Table data={dummyData()} columns={cols} stripedRows />
      </div>
    </Layout>
  )
}
