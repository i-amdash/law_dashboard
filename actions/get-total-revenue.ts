import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const getTotalRevenue = async (storeId: string) => {
  // Get all paid orders with their order items and productss
  const { data: paidOrders, error } = await supabase
    .from('orders')
    .select(`
      id,
      orderItems:order_items (
        products (
          price
        )
      )
    `)
    .eq('store_id', storeId)
    .eq('is_paid', true);

  if (error) {
    console.error('Error fetching total revenue:', error);
    return 0;
  }

  if (!paidOrders) {
    return 0;
  }

  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      // Handle potential null values and convert price to number if needed
      const price = item.products?.price ?? 0;
      return orderSum + Number(price);
    }, 0);
    return total + orderTotal;
  }, 0);

  return totalRevenue;
};