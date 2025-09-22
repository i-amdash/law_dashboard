import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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
    const { email, password } = await req.json();

    // Validate inputs
    if (!email || !password) {
      return new NextResponse(JSON.stringify({ error: "Email and password are required" }), { 
        status: 400,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      });
    }

    // Get user by email first
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return new NextResponse(JSON.stringify({ error: "Invalid credentials" }), { 
        status: 401,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      });
    }

    // Hash the provided password and compare
    const hashedPassword = hashPassword(password);
    
    if (user.password !== hashedPassword) {
      return new NextResponse(JSON.stringify({ error: "Invalid credentials" }), { 
        status: 401,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if user is using temporary password
    const isTemporaryPassword = user.is_temp_password || false;
    let tempPasswordExpired = false;

    if (isTemporaryPassword && user.temp_password_created_at) {
      const createdAt = new Date(user.temp_password_created_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        tempPasswordExpired = true;
      }
    }

    if (tempPasswordExpired) {
      return new NextResponse(JSON.stringify({ 
        error: "Temporary password has expired. Please request a new one." 
      }), { 
        status: 401,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      });
    }

    // Return user data (excluding password)
    const { password: _, ...userData } = user;

    return NextResponse.json(
      { 
        user: userData, 
        message: "Login successful",
        requiresPasswordChange: isTemporaryPassword && !tempPasswordExpired
      },
      { 
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), { 
      status: 500,
      headers: {
        ...getCorsHeaders(origin),
        'Content-Type': 'application/json'
      }
    });
  }
}
