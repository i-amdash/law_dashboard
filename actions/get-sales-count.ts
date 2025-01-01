import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ''; // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

export const getSalesCount = async (storeId: string) => {
  try {
    const { count, error } = await supabase
      .from('orders') // Replace with your actual table name
      .select('*', { count: 'exact' }) // Count the rows
      .eq('store_id', storeId) // Use the correct column name for store ID
      .eq('is_paid', true); // Filter for paid orders

    if (error) {
      throw error; // Handle error appropriately
    }

    return count; // Return the sales count
  } catch (error) {
    console.error("Error fetching sales count:", error);
    throw new Error("Could not fetch sales count");
  }
};
