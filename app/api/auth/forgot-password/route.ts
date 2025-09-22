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

// Function to generate a secure temporary password
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Function to hash password
function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, process.env.SALT!, 1000, 64, "sha512").toString("hex");
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { 
          status: 400,
          headers: getCorsHeaders(origin)
        }
      );
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (fetchError || !existingUser) {
      // Don't reveal if email exists for security reasons
      // But still return success to prevent email enumeration
      return NextResponse.json(
        { message: "If an account with this email exists, a temporary password has been sent." },
        { 
          status: 200,
          headers: getCorsHeaders(origin)
        }
      );
    }

    // Generate temporary password
    const tempPassword = generateTemporaryPassword();
    const hashedTempPassword = hashPassword(tempPassword);

    // Update user with temporary password and mark it as temporary
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password: hashedTempPassword,
        is_temp_password: true,
        temp_password_created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingUser.id);

    if (updateError) {
      console.error("Error updating user with temporary password:", updateError);
      return NextResponse.json(
        { error: "Failed to generate temporary password" },
        { 
          status: 500,
          headers: getCorsHeaders(origin)
        }
      );
    }

    // Send email with temporary password
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .temp-password { 
              background: #fff; 
              padding: 15px; 
              margin: 20px 0; 
              border: 2px solid #000; 
              font-size: 18px; 
              font-weight: bold; 
              text-align: center; 
              letter-spacing: 2px;
            }
            .warning { 
              background: #ffe6e6; 
              border-left: 4px solid #ff4444; 
              padding: 10px; 
              margin: 15px 0; 
            }
            .button { 
              display: inline-block; 
              background: #000; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 4px; 
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>O&B Apparel - Temporary Password</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password. Here's your temporary password:</p>
              
              <div class="temp-password">
                ${tempPassword}
              </div>
              
              <div class="warning">
                <strong>Important:</strong> This is a temporary password that expires in 24 hours. 
                Please sign in and change your password immediately.
              </div>
              
              <p>To sign in:</p>
              <ol>
                <li>Go to the sign-in page</li>
                <li>Use your email and the temporary password above</li>
                <li>You'll be prompted to create a new password</li>
              </ol>
              
              <a href="${origin}/signin" class="button">Sign In Now</a>
              
              <p>If you didn't request this password reset, please contact us immediately.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #666;">
                This email was sent by O&B Apparel. If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "O&B Apparel - Temporary Password",
        html: emailHtml,
      });
      console.log("Email sent successfully to:", email);
    } catch (emailError: any) {
      console.error("Email sending failed:", emailError);
      throw new Error(`Failed to send email: ${emailError?.message || 'Unknown email error'}`);
    }

    return NextResponse.json(
      { message: "Temporary password sent to your email" },
      { 
        status: 200,
        headers: getCorsHeaders(origin)
      }
    );

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: getCorsHeaders(origin)
      }
    );
  }
}