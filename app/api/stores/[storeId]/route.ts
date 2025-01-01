import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ''; // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // Update store using Supabase
    const { data: store, error } = await supabase
      .from('stores') // Ensure this matches your Supabase table name
      .update({ name })
      .eq('id', params.storeId)
      .eq('user_id', userId) // Adjust field name to match your Supabase schema
      .select()
      .single();

    if (error) {
      throw error; // Handle the error appropriately
    }
  
    return NextResponse.json(store);
  } catch (error) {
    console.log('[STORE_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // Delete store using Supabase
    const { data: store, error } = await supabase
      .from('stores') // Ensure this matches your Supabase table name
      .delete()
      .eq('id', params.storeId)
      .eq('user_id', userId) // Adjust field name to match your Supabase schema
      .select()
      .single();

    if (error) {
      throw error; // Handle the error appropriately
    }
  
    return NextResponse.json(store);
  } catch (error) {
    console.log('[STORE_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
