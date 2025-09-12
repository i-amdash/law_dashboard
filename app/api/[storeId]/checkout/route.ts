import { NextResponse } from "next/server";
import axios from "axios";
import { nanoid } from "nanoid";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
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

const axiosPaystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Debug log for Paystack API key
console.log('Paystack API Key exists:', !!process.env.PAYSTACK_API_KEY);

// Helper function to get CORS headers based on the request origin
const getCorsHeaders = (origin: string | null) => {
  // Log the incoming origin for debugging
  console.log('Incoming origin:', origin);

  // Allow requests from your frontend domains - include versions with and without trailing slash
  const allowedOrigins = [
    'https://onbapparel.vercel.app',
    'https://onbapparel.vercel.app/',
    'https://onbdashboard.vercel.app',
    'https://onbdashboard.vercel.app/',
    'http://localhost:3000',
    'http://localhost:3001'
  ];

  // Log whether the origin is in our allowed list
  console.log('Origin is allowed:', origin ? allowedOrigins.includes(origin) : false);

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin && allowedOrigins.includes(origin) 
      ? origin 
      : 'https://onbapparel.vercel.app',
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };

  // Log the headers we're sending back
  console.log('CORS Headers being sent:', corsHeaders);

  return corsHeaders;
};

export async function OPTIONS(req: Request) {
  // Log that we're handling an OPTIONS request
  console.log('Handling OPTIONS request');
  
  const origin = req.headers.get("origin");
  return new NextResponse(null, { 
    headers: getCorsHeaders(origin)
  });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  // Log that we're handling a POST request
  console.log('Handling POST request');
  
  const origin = req.headers.get("origin");
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  try {
    // Verify store exists first
    console.log('Checking if store exists:', params.storeId);
    const { data: storeExists, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', params.storeId)
      .single();
    
    if (storeError || !storeExists) {
      console.error('Store verification error:', storeError);
      return new NextResponse(`Invalid store ID: ${params.storeId}`, { 
        status: 404,
        headers: getCorsHeaders(origin)
      });
    }
    
    const { 
      productIds, 
      phone, 
      email, 
      fullName, 
      createAccount, 
      productGenders = [], 
      productQuantities = [],
      address,
      height,
      capSize,
      shirtSize,
      profileImage
    } = await req.json();
    
    console.log('Received product IDs:', productIds);
    console.log('Received product quantities:', productQuantities);
    console.log('Received product genders:', productGenders);

    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productError || !products?.length) {
      console.error('Product error:', productError);
      return new NextResponse("Products not found", { 
        status: 404,
        headers: getCorsHeaders(origin)
      });
    }

    const reference = `P-${nanoid(6)}`;
    
    // Calculate total based on quantities
    let amount = 0;
    for (let i = 0; i < productIds.length; i++) {
      const product = products.find(p => p.id === productIds[i]);
      const quantity = productQuantities[i] || 1;
      if (product) {
        amount += Number(product.price) * quantity;
      }
    }

    // Check if user wants to create an account and if user already exists
    let userId = null;
    if (createAccount) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Generate a random password
        const generatedPassword = crypto.randomBytes(4).toString('hex');
        
        // Create new user
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            full_name: fullName || email.split('@')[0],
            email: email,
            phone: phone,
            password: generatedPassword, // In production, this should be hashed
            height: height || null,
            cap_size: capSize || null,
            shirt_size: shirtSize || null,
            profile_image: profileImage || null
          })
          .select()
          .single();
        
        if (userError) {
          console.error('User creation error:', userError);
        } else {
          userId = newUser.id;
          
          // Send welcome email with password
          try {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: email,
              subject: 'Your O&B Apparels Account',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Welcome to O&B Apparels!</h2>
                  <p>Your account has been created successfully.</p>
                  <p>Here are your login details:</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Temporary Password:</strong> ${generatedPassword}</p>
                  <p>For security reasons, please log in and change your password as soon as possible.</p>
                  <p>Thank you for shopping with us!</p>
                </div>
              `
            });
          } catch (emailError) {
            console.error('Email sending error:', emailError);
          }
        }
      }
    }

    // Create the order with minimal fields to avoid schema issues
    // First try with minimal fields
    const minimalOrderData = {
      store_id: params.storeId,
      is_paid: false,
      reference,
      status: 'pending'
    };
    
    console.log('Creating order with minimal data:', minimalOrderData);
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(minimalOrderData)
      .select()
      .single();
      
    if (orderError) {
      console.error('Order creation error with minimal fields:', orderError);
      return new NextResponse(`Failed to create order: ${orderError.message || 'Unknown error'}`, { 
        status: 500,
        headers: getCorsHeaders(origin)
      });
    }
    
    // Then update with additional fields
    const updateData: any = {};
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    if (userId) updateData.user_id = userId;
    
    console.log('Updating order with additional data:', updateData);
    
    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id);
    }
    
    console.log('Order created successfully:', order.id);
    
    // Create order items with quantity and gender
    const basicOrderItems = productIds.map((productId: string, index: number) => ({
      order_id: order.id,
      product_id: productId,
      quantity: productQuantities[index] || 1,
      gender: productGenders[index] || 'unisex'
    }));
    
    console.log('Creating order items with quantity and gender:', basicOrderItems);
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(basicOrderItems);
    
    if (itemsError) {
      console.error('Failed to create order items:', itemsError);
      await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);
      return new NextResponse(`Failed to create order items: ${itemsError.message || 'Unknown error'}`, { 
        status: 500,
        headers: getCorsHeaders(origin)
      });
    }    const paymentPayload = {
      amount: amount * 100,
      email,
      reference,
      metadata: {
        custom_fields: [
          {
            display_name: "Phone Number",
            variable_name: "phone",
            value: phone,
          },
        ],
      },
    };

    // Create Paystack payment
    try {
      console.log('Initializing Paystack payment with payload:', paymentPayload);
      
      const { data: paystackResponse } = await axiosPaystack.post(
        "/transaction/initialize", 
        paymentPayload
      );
      
      console.log('Paystack response:', paystackResponse);

      if (!paystackResponse?.status) {
        console.error('Paystack initialization failed:', paystackResponse);
        await supabase
          .from('orders')
          .delete()
          .eq('id', order.id);
        return new NextResponse("Payment initialization failed", { 
          status: 500,
          headers: getCorsHeaders(origin)
        });
      }

      // Send order confirmation to store owner
      try {
        const { data: store } = await supabase
          .from('stores')
          .select('name, user_id')
          .eq('id', params.storeId)
          .single();
        
        if (store) {
          const productNames = products.map(p => p.name).join(', ');
          
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            subject: 'New Order Received',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>New Order Received</h2>
                <p><strong>Order Reference:</strong> ${reference}</p>
                <p><strong>Customer Email:</strong> ${email}</p>
                <p><strong>Customer Phone:</strong> ${phone}</p>
                <p><strong>Amount:</strong> ${amount}</p>
                <p><strong>Products:</strong> ${productNames}</p>
                <p>Please check your dashboard for more details.</p>
              </div>
            `
          });
        }
      } catch (emailError) {
        console.error('Admin notification email error:', emailError);
        // Continue with checkout even if admin email fails
      }

      return NextResponse.json(
        { url: paystackResponse.data.authorization_url },
        { 
          headers: {
            ...getCorsHeaders(origin),
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (paystackError: any) {
      console.error('Paystack API error:', paystackError);
      await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);
      return new NextResponse(`Payment service error: ${paystackError.message || 'Unknown error'}`, { 
        status: 500,
        headers: getCorsHeaders(origin)
      });
    }

  } catch (error) {
    console.error('Checkout error:', error);
    return new NextResponse("Internal server error", { 
      status: 500,
      headers: getCorsHeaders(origin)
    });
  }
}