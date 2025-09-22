"use client"

import { ColumnDef } from "@tanstack/react-table"
// import { CellAction } from "./cell-action"

export type AmbassadorColumn = {
  id: string;
  name: string;
  position: string;
  image_url: string;
  instagram_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export const columns: ColumnDef<AmbassadorColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "instagram_url",
    header: "Instagram",
    cell: ({ row }) => (
      <div className="max-w-xs truncate">
        {row.original.instagram_url}
      </div>
    )
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
    cell: ({ row }) => {
      // Lazy load CellAction to avoid circular dependency
      const { CellAction } = require("./cell-action");
      return <CellAction data={row.original} />;
    },
  },
];