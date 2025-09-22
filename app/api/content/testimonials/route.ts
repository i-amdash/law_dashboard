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

// GET - Get all active testimonials
export async function GET(req: Request) {
  const origin = req.headers.get("origin");
  
  try {
    const { data: testimonials, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching testimonials:', error);
      return new NextResponse("Error fetching testimonials", { 
        status: 500,
        headers: getCorsHeaders(origin)
      });
    }

    return NextResponse.json(
      { testimonials },
      { 
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Testimonials fetch error:', error);
    return new NextResponse("Internal server error", { 
      status: 500,
      headers: getCorsHeaders(origin)
    });
  }
}

// POST - Create new testimonial
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  
  try {
    const { name, position, company, content, display_order, is_active = true } = await req.json();

    if (!name || !content) {
      return new NextResponse("Missing required fields: name and content are required", { 
        status: 400,
        headers: getCorsHeaders(origin)
      });
    }

    const { data: testimonial, error } = await supabase
      .from('testimonials')
      .insert([{
        name,
        position: position || null,
        company: company || null,
        content,
        display_order: display_order || 0,
        is_active
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating testimonial:', error);
      return new NextResponse("Error creating testimonial", { 
        status: 500,
        headers: getCorsHeaders(origin)
      });
    }

    return NextResponse.json(
      { testimonial },
      { 
        status: 201,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Testimonial creation error:', error);
    return new NextResponse("Internal server error", { 
      status: 500,
      headers: getCorsHeaders(origin)
    });
  }
}