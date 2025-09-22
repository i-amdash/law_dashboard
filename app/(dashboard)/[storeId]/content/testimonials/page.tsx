import { format } from "date-fns";
import { createClient } from "@supabase/supabase-js";

import { TestimonialClient } from "./components/client";
import { TestimonialColumn } from "./components/columns";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0;

const TestimonialsPage = async ({ params }: { params: { storeId: string } }) => {
  try {
    const { data: testimonials, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("store_id", params.storeId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    if (!testimonials) {
      return (
        <div className="flex-col">
          <div className="flex-1 space-y-4 p-8 pt-6">
            <TestimonialClient data={[]} />
          </div>
        </div>
      );
    }

    // Format the testimonials
    const formattedTestimonials: TestimonialColumn[] = testimonials.map((item) => ({
      id: item.id,
      name: item.name,
      position: item.position || '',
      company: item.company || '',
      content: item.content || '',
      display_order: item.display_order,
      is_active: item.is_active,
      created_at: format(new Date(item.created_at), "MMMM do, yyyy"),
    }));

    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <TestimonialClient data={formattedTestimonials} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading testimonials:", error);
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div>Error loading testimonials</div>
        </div>
      </div>
    );
  }
};

export default TestimonialsPage;