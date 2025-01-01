import { createClient } from '@supabase/supabase-js';
import { ProductForm } from "./components/product-form";

// Initialize Supabase client with error handling for missing environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ProductPage = async ({
  params
}: {
  params: { productId: string, storeId: string }
}) => {
  // Simplified query to get all product data including the images JSONB
  const { data: product} = await supabase
    .from('products')
    .select('*')
    .eq('id', params.productId)
    .eq('store_id', params.storeId)
    .single();

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm 
          initialData={product}
        />
      </div>
    </div>
  );
};

export default ProductPage;
