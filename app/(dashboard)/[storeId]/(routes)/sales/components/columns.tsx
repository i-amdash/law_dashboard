"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type SaleColumn = {
  id: string;
  reference: string;
  email: string;
  products: string;
  totalAmount: string;
  status: string;
  saleDate: string;
  productCount: number;
}

export const columns: ColumnDef<SaleColumn>[] = [
  {
    accessorKey: "reference",
    header: "Order Ref",
  },
  {
    accessorKey: "email",
    header: "Customer Email",
  },
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "productCount",
    header: "Items",
  },
  {
    accessorKey: "totalAmount",
    header: "Revenue",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "saleDate",
    header: "Sale Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];