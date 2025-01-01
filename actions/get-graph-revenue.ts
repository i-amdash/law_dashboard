
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ''; // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

interface GraphData {
  name: string;
  total: number;
}

export const getGraphRevenue = async (storeId: string): Promise<GraphData[]> => {
  try {
    // Fetch paid orders with order items and products
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
      throw error; // Handle error appropriately
    }

    const monthlyRevenue: { [key: number]: number } = {};

    // Grouping the orders by month and summing the revenue
    for (const order of paidOrders) {
      const month = new Date(order.created_at).getMonth(); // Assuming created_at is in the format compatible with Date
      let revenueForOrder = 0;

      for (const item of order.order_items) {
        revenueForOrder += item.products?.price || 0; // Safeguard against undefined price
      }

      // Adding the revenue for this order to the respective month
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
    }

    // Converting the grouped data into the format expected by the graph
    const graphData: GraphData[] = Array.from({ length: 12 }, (_, index) => ({
      name: new Date(0, index).toLocaleString('default', { month: 'short' }), // Get abbreviated month name
      total: 0,
    }));

    // Filling in the revenue data
    for (const month in monthlyRevenue) {
      graphData[parseInt(month)].total = monthlyRevenue[parseInt(month)];
    }

    return graphData;
  } catch (error) {
    console.error("Error fetching graph revenue:", error);
    throw new Error("Could not fetch graph revenue");
  }
};
