import { format } from "date-fns";
import { formatter } from "@/lib/utils";

import { OrderColumn } from "./components/columns";
import { OrderClient } from "./components/client";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const OrdersPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (*)
      )
    `)
    .eq('store_id', params.storeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return <div>Error fetching orders</div>;
  }

  interface OrderItem {
    product?: {
      name?: string;
      price?: number;
    };
  }

  interface Order {
    id: string;
    phone: string;
    address: string;
    order_items?: OrderItem[];
    is_paid: boolean;
    created_at: string;
  }

  interface OrderColumn {
    id: string;
    phone: string;
    address: string;
    products: string;
    totalPrice: string;
    isPaid: boolean;
    createdAt: string;
  }

  const formattedOrders: OrderColumn[] = (orders as Order[] || []).map((item) => ({
    id: item.id,
    phone: item.phone,
    address: item.address,
    products: item.order_items?.map((orderItem) => orderItem.product?.name).join(', ') || '',
    totalPrice: formatter.format(
      item.order_items?.reduce((total, orderItem) => {
        return total + Number(orderItem.product?.price || 0);
      }, 0) || 0
    ),
    isPaid: item.is_paid,
    createdAt: format(new Date(item.created_at), 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;
