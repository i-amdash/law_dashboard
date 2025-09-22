import { format } from "date-fns";
import { createClient } from "@supabase/supabase-js";

import { AmbassadorClient } from "./components/client";
import { AmbassadorColumn } from "./components/columns";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0;

const AmbassadorsPage = async ({ params }: { params: { storeId: string } }) => {
  try {
    const { data: ambassadors, error } = await supabase
      .from("ambassadors")
      .select("*")
      .eq("store_id", params.storeId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    if (!ambassadors) {
      return (
        <div className="flex-col">
          <div className="flex-1 space-y-4 p-8 pt-6">
            <AmbassadorClient data={[]} />
          </div>
        </div>
      );
    }

    // Format the ambassadors
    const formattedAmbassadors: AmbassadorColumn[] = ambassadors.map((item) => ({
      id: item.id,
      name: item.name,
      position: item.position || '',
      image_url: item.image_url || '',
      instagram_url: item.instagram_url || '',
      display_order: item.display_order,
      is_active: item.is_active,
      created_at: format(new Date(item.created_at), "MMMM do, yyyy"),
    }));

    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <AmbassadorClient data={formattedAmbassadors} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading ambassadors:", error);
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div>Error loading ambassadors</div>
        </div>
      </div>
    );
  }
};

export default AmbassadorsPage;