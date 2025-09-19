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

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  
  try {
    const { fullName, email, phone, password, height, cap_size, shirt_size, profile_image } = await req.json();

    // Validate inputs
    if (!email || !fullName || !phone) {
      return new NextResponse(JSON.stringify({ error: "All fields are required" }), { 
        status: 400,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle(); // Using maybeSingle() to avoid error when user doesn't exist

    if (findError) {
      console.error("Error checking for existing user:", findError);
    }

    if (existingUser) {
      return new NextResponse(JSON.stringify({ error: "User with this email already exists" }), { 
        status: 409,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      });
    }

    // Generate password if not provided
    const userPassword = password || crypto.randomBytes(4).toString('hex');

    // Create new user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        full_name: fullName,
        email: email,
        phone: phone,
        password: userPassword, // In production, this should be hashed
        height: height,
        cap_size: cap_size,
        shirt_size: shirt_size,
        profile_image: profile_image
      })
      .select()
      .single();
    
    if (userError) {
      console.error('User registration error:', userError);
      return new NextResponse(JSON.stringify({ 
        error: "Failed to create user", 
        details: userError.message 
      }), { 
        status: 500,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Check if user was actually created
    if (!newUser) {
      console.error('User was not created, but no error was returned');
      return new NextResponse(JSON.stringify({ 
        error: "Failed to create user, no data returned" 
      }), { 
        status: 500,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      });
    }

    // Send welcome email with password if system generated
    if (!password) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Welcome to O&B Apparels',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Welcome to O&B Apparels!</h2>
              <p>Your account has been created successfully.</p>
              <p>Here are your login details:</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${userPassword}</p>
              <p>For security reasons, please log in and change your password as soon as possible.</p>
              <p>Thank you for shopping with us!</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Continue with registration even if email fails
      }
    }

    // Return user data (excluding password)
    const { password: _, ...userData } = newUser;

    return NextResponse.json(
      { user: userData, message: "Registration successful" },
      { 
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), { 
      status: 500,
      headers: {
        ...getCorsHeaders(origin),
        'Content-Type': 'application/json'
      }
    });
  }
}
