import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configure nodemailer transporter
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
      : 'https://onbdashboard.vercel.app',
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

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, orderId: string } }
) {
  const origin = req.headers.get("origin");
  
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        reference,
        is_paid,
        status,
        phone,
        address,
        user_id,
        created_at,
        updated_at,
        users:user_id (
          id,
          full_name,
          email,
          phone
        ),
        order_items (
          id,
          product_id,
          products:product_id (
            id,
            name,
            price,
            images
          )
        )
      `)
      .eq('id', params.orderId)
      .eq('store_id', params.storeId)
      .single();
      
    if (error) {
      console.error('Error fetching order:', error);
      return new NextResponse("Error fetching order", { 
        status: 500,
        headers: getCorsHeaders(origin)
      });
    }

    return NextResponse.json(
      { order },
      { 
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Order fetch error:', error);
    return new NextResponse("Internal server error", { 
      status: 500,
      headers: getCorsHeaders(origin)
    });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, orderId: string } }
) {
  const origin = req.headers.get("origin");
  
  try {
    const { status } = await req.json();

    // Validate status
    const validStatuses = ['pending', 'out for delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return new NextResponse(JSON.stringify({ error: "Invalid status" }), { 
        status: 400,
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      });
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.orderId)
      .eq('store_id', params.storeId)
      .select(`
        id,
        reference,
        is_paid,
        status,
        phone,
        address,
        user_id,
        users:user_id (
          id,
          full_name,
          email,
          phone
        )
      `)
      .single();

    if (updateError) {
      console.error('Order status update error:', updateError);
      return new NextResponse("Error updating order status", { 
        status: 500,
        headers: getCorsHeaders(origin)
      });
    }

    // Send email notification to customer if email is available
    if (updatedOrder.users && updatedOrder.users[0]?.email) {
      try {
        const statusMessages = {
          'pending': 'Your order is being processed.',
          'out for delivery': 'Your order is out for delivery and will arrive soon.',
          'delivered': 'Your order has been delivered. Thank you for shopping with us!',
          'cancelled': 'Your order has been cancelled. Please contact us if you have any questions.'
        };

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: updatedOrder.users[0].email,
          subject: `Order Status Update - ${updatedOrder.reference}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Order Status Update</h2>
              <p>Dear ${updatedOrder.users[0].full_name || 'Customer'},</p>
              <p>Your order with reference <strong>${updatedOrder.reference}</strong> has been updated.</p>
              <p><strong>New Status:</strong> ${status}</p>
              <p>${statusMessages[status as keyof typeof statusMessages]}</p>
              <p>If you have any questions, please contact us.</p>
              <p>Thank you for shopping with O&B Apparels!</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // Continue even if email fails
      }
    }

    return NextResponse.json(
      { order: updatedOrder, message: "Order status updated successfully" },
      { 
        headers: {
          ...getCorsHeaders(origin),
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Order status update error:', error);
    return new NextResponse("Internal server error", { 
      status: 500,
      headers: getCorsHeaders(origin)
    });
  }
}
