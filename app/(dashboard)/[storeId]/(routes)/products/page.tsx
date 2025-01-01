
import { format } from "date-fns";
import { createClient } from "@supabase/supabase-js";
import { formatter } from "@/lib/utils";
import { ProductsClient } from "./components/client";
import { ProductColumn } from "./components/columns";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""; // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""; // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0;

const ProductsPage = async ({ params }: { params: { storeId: string } }) => {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", params.storeId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!products) return <div>No products found</div>;

    // Format the products
    const formattedProducts: ProductColumn[] = products.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      is_featured: item.is_featured,
      is_sold: item.is_sold,
      is_archived: item.is_archived,
      price: formatter.format(item.price), // Assuming price is already a number
      createdAt: format(new Date(item.created_at), "MMMM do, yyyy"), // Supabase stores timestamps in ISO format
    }));

    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <ProductsClient data={formattedProducts} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error:", error);
    return <div>Error loading products</div>;
  }
};

export default ProductsPage;
