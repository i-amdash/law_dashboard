import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ''; // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

export const getStockCount = async (storeId: string) => {
  try {
    const { count, error } = await supabase
      .from('products') // Replace with your actual table name
      .select('*', { count: 'exact' }) // Count the rows
      .eq('store_id', storeId) // Use the correct column name for store ID
      .eq('is_archived', false); // Filter for non-archived products

    if (error) {
      throw error; // Handle error appropriately
    }

    return count; // Return the stock count
  } catch (error: any) {
    console.error("Error fetching stock count:", error);
    return 0; // Return 0 instead of throwing an error
  }
};
