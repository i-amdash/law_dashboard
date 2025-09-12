"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";

import { User } from "@/types";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

interface UsersClientProps {
  users: User[];
}

export const UsersClient: React.FC<UsersClientProps> = ({
  users
}) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Users (${users.length})`}
          description="Manage users and view their details"
        />
      </div>
      <Separator />
      <DataTable columns={columns} data={users} searchKey="email" />
    </>
  );
};
