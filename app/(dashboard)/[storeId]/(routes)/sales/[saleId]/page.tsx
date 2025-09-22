import { format } from "date-fns";
import { createClient } from '@supabase/supabase-js';
import { formatter } from "@/lib/utils";

import { SaleDetailsClient } from "./components/client";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SaleDetailsPage = async ({
  params
}: {
  params: { storeId: string; saleId: string }
}) => {
  console.log('Fetching sale with ID:', params.saleId, 'for store:', params.storeId);

  // Fetch the specific sale (order) with all details
  const { data: sale, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (*)
      )
    `)
    .eq('id', params.saleId)
    .eq('store_id', params.storeId)
    .eq('is_paid', true) // Only paid orders (sales)
    .single();

  if (error) {
    console.error('Error fetching sale details:', error);
    console.error('Sale ID:', params.saleId);
    console.error('Store ID:', params.storeId);
    return (
      <div className="p-8">
        <h1>Error loading sale details</h1>
        <p>Sale ID: {params.saleId}</p>
        <p>Error: {error.message}</p>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="p-8">
        <h1>Sale not found</h1>
        <p>No sale found with ID: {params.saleId}</p>
      </div>
    );
  }

  console.log('Sale found:', sale);

  // Fetch user data separately if user_id exists
  let userData = null;
  if (sale.user_id) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', sale.user_id)
      .single();
    
    if (!userError) {
      userData = user;
    }
  }

  // Calculate totals and format data
  const orderTotal = sale.order_items?.reduce((total: number, item: any) => {
    const price = Number(item.product?.price || 0);
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0) || 0;

  const totalItems = sale.order_items?.reduce((acc: number, item: any) => 
    acc + (item.quantity || 0), 0
  ) || 0;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SaleDetailsClient 
          sale={sale}
          userData={userData}
          orderTotal={orderTotal}
          totalItems={totalItems}
        />
      </div>
    </div>
  );
};

export default SaleDetailsPage;