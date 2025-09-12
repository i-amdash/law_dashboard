import { createClient } from '@supabase/supabase-js';

import { UserDetailsClient } from './components/client';
import { User } from "@/types";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UserPage = async ({
  params
}: {
  params: { storeId: string, userId: string }
}) => {
  // Fetch user details
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.userId)
    .single();

  if (userError) {
    console.error('Error fetching user:', userError);
    return <div>Error loading user details</div>;
  }

  // Fetch user's orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      id,
      reference,
      is_paid,
      status,
      phone,
      address,
      created_at,
      updated_at,
      order_items (
        id,
        product_id,
        products:product_id (
          id,
          name,
          price,
          images
        )
      )
    `)
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
    // Continue without orders
  }

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UserDetailsClient user={user} orders={orders || []} />
      </div>
    </div>
  );
}
 
export default UserPage;
