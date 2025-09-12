"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Copy, MoreHorizontal, Trash, View } from "lucide-react";
import { toast } from "react-hot-toast";
import { AlertModal } from "@/components/modals/alert-modal";

interface CellActionProps {
  data: User;
}

export const CellAction: React.FC<CellActionProps> = ({
  data,
}) => {
  const router = useRouter();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onView = () => {
    router.push(`/${params.storeId}/users/${data.id}`);
  };

  const onCopy = () => {
    navigator.clipboard.writeText(data.id);
    toast.success('User ID copied to clipboard.');
  };

  return (
    <>
      <AlertModal 
        isOpen={open} 
        onClose={() => setOpen(false)}
        onConfirm={async () => {
          // Delete functionality is not implemented
          // since we don't want to delete users
          setOpen(false);
        }}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={onView}
          >
            <View className="mr-2 h-4 w-4" /> View details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onCopy}
          >
            <Copy className="mr-2 h-4 w-4" /> Copy ID
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
