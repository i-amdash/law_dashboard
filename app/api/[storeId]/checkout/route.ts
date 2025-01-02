import { NextResponse } from "next/server";
import axios from "axios";
import { nanoid } from "nanoid";
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

// Helper function to get CORS headers based on the request origin
const getCorsHeaders = (origin: string | null) => {
  // Log the incoming origin for debugging
  console.log('Incoming origin:', origin);

  // Allow requests from your frontend domains - include versions with and without trailing slash
  const allowedOrigins = [
    'https://onbapparel.vercel.app',
    'https://onbapparel.vercel.app/',
    'https://onbdashboard.vercel.app',
    'https://onbdashboard.vercel.app/',
    'http://localhost:3000',
    'http://localhost:3001'
  ];

  // Log whether the origin is in our allowed list
  console.log('Origin is allowed:', origin ? allowedOrigins.includes(origin) : false);

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin && allowedOrigins.includes(origin) 
      ? origin 
      : 'https://onbapparel.vercel.app',
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };

  // Log the headers we're sending back
  console.log('CORS Headers being sent:', corsHeaders);

  return corsHeaders;
};

export async function OPTIONS(req: Request) {
  // Log that we're handling an OPTIONS request
  console.log('Handling OPTIONS request');
  
  const origin = req.headers.get("origin");
  return new NextResponse(null, { 
    headers: getCorsHeaders(origin)
  });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  // Log that we're handling a POST request
  console.log('Handling POST request');
  
  const origin = req.headers.get("origin");
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  try {
    const { productIds, phone, email } = await req.json();
    console.log('Received product IDs:', productIds);

    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productError || !products?.length) {
      console.error('Product error:', productError);
      return new NextResponse("Products not found", { 
        status: 404,
        headers: getCorsHeaders(origin)
      });
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
      return new NextResponse("Failed to create order", { 
        status: 500,
        headers: getCorsHeaders(origin)
      });
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
      return new NextResponse("Failed to create order items", { 
        status: 500,
        headers: getCorsHeaders(origin)
      });
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
      return new NextResponse("Payment initialization failed", { 
        status: 500,
        headers: getCorsHeaders(origin)
      });
    }

    return NextResponse.json(
      { url: paystackResponse.data.authorization_url },
      { 
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Checkout error:', error);
    return new NextResponse("Internal server error", { 
      status: 500,
      headers: getCorsHeaders(origin)
    });
  }
}