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

// PUT - Update ambassador
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const origin = req.headers.get("origin");
  
  try {
    const { 
      name, 
      position, 
      image_url, 
      instagram_url, 
      display_order, 
      is_active 
    } = await req.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (position !== undefined) updateData.position = position;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (instagram_url !== undefined) updateData.instagram_url = instagram_url;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date().toISOString();

    const { data: ambassador, error } = await supabase
      .from('ambassadors')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating ambassador:', error);
      return new NextResponse("Error updating ambassador", { 
        status: 500,
        headers: getCorsHeaders(origin)
      });
    }

    return NextResponse.json(
      { ambassador },
      { 
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Ambassador update error:', error);
    return new NextResponse("Internal server error", { 
      status: 500,
      headers: getCorsHeaders(origin)
    });
  }
}

// DELETE - Delete ambassador
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const origin = req.headers.get("origin");
  
  try {
    const { error } = await supabase
      .from('ambassadors')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting ambassador:', error);
      return new NextResponse("Error deleting ambassador", { 
        status: 500,
        headers: getCorsHeaders(origin)
      });
    }

    return new NextResponse(null, { 
      status: 204,
      headers: getCorsHeaders(origin)
    });
  } catch (error) {
    console.error('Ambassador deletion error:', error);
    return new NextResponse("Internal server error", { 
      status: 500,
      headers: getCorsHeaders(origin)
    });
  }
}