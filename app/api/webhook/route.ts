import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PaystackPaymentEvent } from "./interfaces";
import { createHmac } from "crypto";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  const payload: PaystackPaymentEvent = await req.json();

  const hash = createHmac("sha512", `${process.env.PAYSTACK_API_KEY}`)
    .update(JSON.stringify(payload))
    .digest("hex");

  console.log(
    '(hash == headers().get("X-Paystack-Signature"))',
    hash === headers().get("X-Paystack-Signature")
  );

  if (hash === headers().get("X-Paystack-Signature")) {
    if (payload.event === "charge.success") {
      // Update the order in Supabase to mark it as paid
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({ is_paid: true }) // Assuming your column is named is_paid
        .eq('reference', payload.data.reference)
        .select('*') // Retrieve the updated order along with related items
        .single(); // Get a single order

      if (orderError || !order) {
        console.error('Order update failed:', orderError);
        return new NextResponse("Order update failed", { status: 400 });
      }

      const productIds = order.order_items.map(
        (orderItem: { product_id: string }) => orderItem.product_id // Update according to your column name
      );

      // Update products to mark them as sold
      const { error: productsError } = await supabase
        .from('products')
        .update({ is_sold: true }) // Assuming your column is named is_sold
        .in('id', productIds);

      if (productsError) {
        console.error('Products update failed:', productsError);
        return new NextResponse("Products update failed", { status: 400 });
      }
    }
  }

  return new NextResponse("Successful!", { status: 200 });
}
