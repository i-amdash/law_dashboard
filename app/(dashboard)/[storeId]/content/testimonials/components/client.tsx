"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { columns, TestimonialColumn } from "./columns";

interface TestimonialClientProps {
  data: TestimonialColumn[];
}

export const TestimonialClient: React.FC<TestimonialClientProps> = ({
  data
}) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Testimonials (${data.length})`} description="Manage testimonials for your store" />
        <Button onClick={() => router.push(`/${params.storeId}/content/testimonials/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
    </>
  );
};