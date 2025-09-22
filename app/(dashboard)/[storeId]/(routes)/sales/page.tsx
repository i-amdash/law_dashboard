import { format } from "date-fns";
import { createClient } from '@supabase/supabase-js';
import { formatter } from "@/lib/utils";

import { SalesClient } from "./components/client";
import { SaleColumn } from "./components/columns";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SalesPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  // Fetch all paid orders (sales) with order items and product details
  const { data: sales, error } = await supabase
    .from('orders')
    .select(`
      id,
      reference,
      is_paid,
      status,
      phone,
      email,
      shipping_address,
      customer_name,
      user_id,
      created_at,
      users:user_id (
        id,
        full_name,
        email,
        phone
      ),
      order_items (
        id,
        quantity,
        product_id,
        product:products (
          id,
          name,
          price,
          images
        )
      )
    `)
    .eq('store_id', params.storeId)
    .eq('is_paid', true) // Only fetch paid orders (sales)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching sales:", error);
    return <div>Error fetching sales data</div>;
  }

  // Format the data for the sales table
  const formattedSales: SaleColumn[] = sales?.map((sale) => {
    // Get product names and calculate total items
    const productNames = sale.order_items?.map((item: any) => {
      const quantity = item.quantity || 1;
      const productName = item.product?.name || 'Unknown Product';
      return `${productName} x${quantity}`;
    }).join(', ') || 'No products';
    
    const totalItems = sale.order_items?.reduce((acc: number, item: any) => 
      acc + (item.quantity || 0), 0
    ) || 0;

    // Get email (prioritize user data, fallback to order data)
    const customerEmail = sale.users?.[0]?.email || 
                         sale.email || 
                         'No email';

    return {
      id: sale.id,
      reference: sale.reference || 'N/A',
      email: customerEmail,
      products: productNames,
      totalAmount: formatter.format(
        sale.order_items?.reduce((total: number, orderItem: any) => {
          const price = Number(orderItem.product?.price || 0);
          const quantity = orderItem.quantity || 1;
          return total + (price * quantity);
        }, 0) || 0
      ),
      status: sale.status || 'pending',
      saleDate: format(new Date(sale.created_at), 'MMM dd, yyyy'),
      productCount: totalItems,
    };
  }) || [];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SalesClient data={formattedSales} />
      </div>
    </div>
  );
};

export default SalesPage;