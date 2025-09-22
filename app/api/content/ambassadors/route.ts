import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to get CORS headers
const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = [
    'https://onbapparel.vercel.app',
    'https://onbapparel.vercel.app/',
    'https://onbdashboard.vercel.app',
    'https://onbdashboard.vercel.app/',
    'http://localhost:3000',
    'http://localhost:3001'
  ];

  return {
    "Access-Control-Allow-Origin": origin && allowedOrigins.includes(origin) 
      ? origin 
      : 'https://onbapparel.vercel.app',
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
};

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, { 
    headers: getCorsHeaders(origin)
  });
}

// GET - Get all active ambassadors
export async function GET(req: Request) {
  const origin = req.headers.get("origin");
  
  try {
    const { data: ambassadors, error } = await supabase
      .from('ambassadors')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching ambassadors:', error);
      return new NextResponse("Error fetching ambassadors", { 
        status: 500,
        headers: getCorsHeaders(origin)
      });
    }

    return NextResponse.json(
      { ambassadors },
      { 
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Ambassadors fetch error:', error);
    return new NextResponse("Internal server error", { 
      status: 500,
      headers: getCorsHeaders(origin)
    });
  }
}

// POST - Create new ambassador
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  
  try {
    const { 
      name, 
      position, 
      image_url, 
      instagram_url, 
      display_order, 
      is_active = true 
    } = await req.json();

    if (!name || !position || !image_url || !instagram_url) {
      return new NextResponse("Missing required fields: name, position, image_url, and instagram_url are required", { 
        status: 400,
        headers: getCorsHeaders(origin)
      });
    }

    const { data: ambassador, error } = await supabase
      .from('ambassadors')
      .insert([{
        name,
        position,
        image_url,
        instagram_url,
        display_order: display_order || 0,
        is_active
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating ambassador:', error);
      return new NextResponse("Error creating ambassador", { 
        status: 500,
        headers: getCorsHeaders(origin)
      });
    }

    return NextResponse.json(
      { ambassador },
      { 
        status: 201,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Ambassador creation error:', error);
    return new NextResponse("Internal server error", { 
      status: 500,
      headers: getCorsHeaders(origin)
    });
  }
}