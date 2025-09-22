import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

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

// Function to hash password
function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, process.env.SALT!, 1000, 64, "sha512").toString("hex");
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  
  try {
    const { newPassword, userId } = await req.json();

    if (!newPassword) {
      return NextResponse.json(
        { error: "New password is required" },
        { 
          status: 400,
          headers: getCorsHeaders(origin)
        }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { 
          status: 400,
          headers: getCorsHeaders(origin)
        }
      );
    }

    // For now, we'll need to get the user ID from the request or session
    // In a production app, you'd typically get this from a JWT token or session
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { 
          status: 401,
          headers: getCorsHeaders(origin)
        }
      );
    }

    // Hash the new password
    const hashedPassword = hashPassword(newPassword);

    // Update the user's password and remove temporary password flags
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password: hashedPassword,
        is_temp_password: false,
        temp_password_created_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json(
        { error: "Failed to update password" },
        { 
          status: 500,
          headers: getCorsHeaders(origin)
        }
      );
    }

    return NextResponse.json(
      { message: "Password updated successfully" },
      { 
        status: 200,
        headers: getCorsHeaders(origin)
      }
    );

  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: getCorsHeaders(origin)
      }
    );
  }
}