import { format } from "date-fns";
import { createClient } from "@supabase/supabase-js";

import { CarouselClient } from "./components/client";
import { CarouselColumn } from "./components/columns";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0;

const CarouselPage = async ({ params }: { params: { storeId: string } }) => {
  try {
    const { data: carouselItems, error } = await supabase
      .from("carousel")
      .select("*")
      .eq("store_id", params.storeId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    if (!carouselItems) {
      return (
        <div className="flex-col">
          <div className="flex-1 space-y-4 p-8 pt-6">
            <CarouselClient data={[]} />
          </div>
        </div>
      );
    }

    // Format the carousel items
    const formattedCarouselItems: CarouselColumn[] = carouselItems.map((item) => ({
      id: item.id,
      name: item.name,
      display_order: item.display_order,
      is_active: item.is_active,
      created_at: format(new Date(item.created_at), "MMMM do, yyyy"),
    }));

    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <CarouselClient data={formattedCarouselItems} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading carousel items:", error);
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div>Error loading carousel items</div>
        </div>
      </div>
    );
  }
};

export default CarouselPage;