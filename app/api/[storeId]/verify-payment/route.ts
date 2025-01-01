import { NextResponse } from "next/server";
import axios from "axios";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided');
}

const supabase = createClient(supabaseUrl, supabaseKey);

type PaystackResponse = {
  status: boolean;
  message: string;
  data: any;
};

const axiosPaystack = axios.create({
  baseURL: "https://api.paystack.co",
});
axiosPaystack.defaults.headers.common[
  "authorization"
] = `Bearer ${process.env.PAYSTACK_API_KEY}`;
axiosPaystack.defaults.headers.common["content_type"] =
  "Content-Type: application/json";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { reference: string } }
) {
  // Verify the transaction with Paystack
  const resp: Request & { data: PaystackResponse } = await axiosPaystack.get(
    `/transaction/verify/${params.reference}`
  );

  console.log("🚀 ~ file: route.ts:37 ~ resp:", JSON.stringify(resp, null, 2));

  if (!resp.data.status) {
    return NextResponse.json(
      { url: `${process.env.FRONTEND_STORE_URL}/cart?cancelled=1` },
      {
        headers: corsHeaders,
      }
    );
  }

  // Update the order in Supabase to mark it as paid
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .update({ is_paid: true }) // Update the is_paid status
    .eq('reference', params.reference)
    .single();

  if (orderError || !order) {
    console.error('Order update failed:', orderError);
    return NextResponse.json(
      { url: `${process.env.FRONTEND_STORE_URL}/cart?cancelled=1`, status: false },
      {
        headers: corsHeaders,
      }
    );
  }

  return NextResponse.json(
    { url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`, status: true },
    {
      headers: corsHeaders,
    }
  );
}
