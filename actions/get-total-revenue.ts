import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Product {
  price: number;
}

interface OrderItem {
  product: Product;
}

interface Order {
  id: string;
  orderItems: OrderItem[];
}

export const getTotalRevenue = async (storeId: string) => {
  const { data: paidOrders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (price)
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
    const orderTotal = order.order_items.reduce((orderSum: number, item: { products: { price: number } }) => {
      return orderSum + (item.products?.price || 0);
    }, 0);
    return total + orderTotal;
  }, 0);

  return totalRevenue;
};