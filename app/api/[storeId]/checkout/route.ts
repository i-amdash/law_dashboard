import { NextResponse } from "next/server";
import axios from "axios";
import { nanoid } from "nanoid";
import {
  InitiateTransactionArgs,
  PaystackResponse,
} from "../../webhook/interfaces";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const axiosPaystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { productIds, phone, email } = await req.json();
    console.log('Received product IDs:', productIds);

    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productError || !products?.length) {
      console.error('Product error:', productError);
      return new NextResponse("Products not found", { status: 404 });
    }

    const reference = `P-${nanoid(6)}`;
    const amount = products.reduce((total, { price }) => total + Number(price), 0);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id: params.storeId,
        is_paid: false,
        phone,
        address: email,
        reference
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return new NextResponse("Failed to create order", { status: 500 });
    }

    const orderItems = productIds.map((productId: string) => ({
      order_id: order.id,
      product_id: productId
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items error:', itemsError);
      await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);
      return new NextResponse("Failed to create order items", { status: 500 });
    }

    const paymentPayload = {
      amount: amount * 100,
      email,
      reference,
      metadata: {
        custom_fields: [
          {
            display_name: "Phone Number",
            variable_name: "phone",
            value: phone,
          },
        ],
      },
    };

    const { data: paystackResponse } = await axiosPaystack.post(
      "/transaction/initialize", 
      paymentPayload
    );

    if (!paystackResponse?.status) {
      await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);
      return new NextResponse("Payment initialization failed", { status: 500 });
    }

    return NextResponse.json(
      { url: paystackResponse.data.authorization_url },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Checkout error:', error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
