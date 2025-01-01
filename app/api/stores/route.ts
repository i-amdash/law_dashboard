import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ''; // Your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Insert store into Supabase
    const store = await supabase
      .from('stores') // Ensure this matches your Supabase table name
      .insert([
        {
          name,
          user_id: userId, // Adjust field name to match your Supabase schema
        }
      ])
      .single(); // Use single() if expecting a single row response
    console.log(store);
    return NextResponse.json(store);
  } catch (error) {
    console.log('[STORES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
