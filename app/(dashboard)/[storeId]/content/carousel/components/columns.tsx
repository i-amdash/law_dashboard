"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type CarouselColumn = {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export const columns: ColumnDef<CarouselColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "display_order",
    header: "Display Order",
  },
  {
    accessorKey: "is_active",
    header: "Active",
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        row.original.is_active 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {row.original.is_active ? 'Active' : 'Inactive'}
      </span>
    )
  },
  {
    accessorKey: "created_at",
    header: "Date Created",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];