import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to get CORS headers based on the request origin
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

export async function PUT(req: Request) {
  const origin = req.headers.get("origin");
  
  try {
    const { 
      userId, 
      fullName,
      email,
      phone,
      height,
      cap_size,
      shirt_size,
      profile_image
    } = await req.json();

    // Validate inputs
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "User ID is required" }), { 
        status: 400,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      });
    }

    // Prepare update object with only provided fields
    const updateData: any = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (height !== undefined) updateData.height = height;
    if (cap_size !== undefined) updateData.cap_size = cap_size;
    if (shirt_size !== undefined) updateData.shirt_size = shirt_size;
    if (profile_image !== undefined) updateData.profile_image = profile_image;
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, full_name, email, phone, height, cap_size, shirt_size, profile_image, created_at, updated_at')
      .single();

    if (updateError) {
      console.error("Error updating user:", updateError);
      return new NextResponse(JSON.stringify({ error: "Failed to update profile" }), { 
        status: 500,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      });
    }

    return NextResponse.json(
      { user: updatedUser },
      { 
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), { 
      status: 500,
      headers: {
        ...getCorsHeaders(origin),
        'Content-Type': 'application/json'
      }
    });
  }
}
