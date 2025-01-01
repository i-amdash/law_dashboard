// import { createClient } from '@supabase/supabase-js';

// interface OrderItem {
//   products: {
//     price: number;
//   };
// }

// interface Order {
//   order_items: OrderItem[];
// }

// // Initialize Supabase client
// const supabaseUrl = process.env.SUPABASE_URL || ''; // Your Supabase URL
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Your Supabase service role key
// const supabase = createClient(supabaseUrl, supabaseKey);

// export const getTotalRevenue = async (storeId: string) => {
//   try {
//     // Check if storeId is valid
//     if (!storeId) {
//       throw new Error("Store ID is required.");
//     }

//     // Fetch paid orders with order items and products
//     const { data: paidOrders, error } = await supabase
//       .from('orders')
//       .select(`
//         *,
//         order_items (
//           *,
//           products (price)
//         )
//       `)
//       .eq('store_id', storeId)
//       .eq('is_paid', true);

//     if (error) {
//       throw error; // Handle error appropriately
//     }

//     // Calculate total revenue
//     const totalRevenue = paidOrders.reduce((total, order) => {
//       const orderTotal = order.order_items.reduce((orderSum: number, item: { products: { price: any; }; }) => {
//         return orderSum + (item.products.price || 0); // Safeguard against undefined price
//       }, 0);
//       return total + orderTotal;
//     }, 0);

//     return totalRevenue;
//   } catch (error) {
//     console.error("Error fetching total revenue:", error);
//     throw new Error("Could not calculate total revenue");
//   }
// };

import { createClient } from '@supabase/supabase-js';

interface OrderItem {
  products: {
    price: number;
  };
}

interface Order {
  order_items: OrderItem[];
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Validate UUID format
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const getTotalRevenue = async (storeId: string) => {
  try {
    // Check if storeId is valid
    if (!storeId) {
      throw new Error("Store ID is required");
    }

    // Convert Clerk ID to UUID or handle accordingly
    // You might need to query a mapping table or modify your database schema
    // For now, we'll assume you have a stores table with clerk_id
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('clerk_id', storeId)
      .single();

    if (storeError || !storeData) {
      throw new Error("Store not found");
    }

    // Use the actual UUID from your stores table
    const { data: paidOrders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (price)
        )
      `)
      .eq('store_id', storeData.id)
      .eq('is_paid', true);

    if (error) {
      throw error;
    }

    const totalRevenue = paidOrders.reduce((total, order) => {
      const orderTotal = order.order_items.reduce((orderSum: number, item: OrderItem): number => {
        return orderSum + (item.products?.price || 0);
      }, 0);
      return total + orderTotal;
    }, 0);

    return totalRevenue;

  } catch (error) {
    console.error("Error fetching total revenue:", error);
    throw new Error("Could not calculate total revenue");
  }
};