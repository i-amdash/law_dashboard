import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    console.log("this is what is coming from the body", body);
    const { name, price, description, images, isFeatured, isSold, isArchived } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Price is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // Check if the store belongs to the user
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', params.storeId)
      .eq('user_id', userId)
      .single();

    if (storeError || !store) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    // Create the product (product) in Supabase
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        name,
        price,
        description,
        is_featured: isFeatured,
        is_sold: isSold,
        is_archived: isArchived,
        store_id: params.storeId,
        images
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('[PRODUCTS_POST]', insertError);
      return new NextResponse("Internal error", { status: 500 });
    }

    // Insert the images for the product
    const { error: imageInsertError } = await supabase
  .from('images')
  .insert(
    images.map((image: { url: string }) => ({
      product_id: product.id,
      url: image.url,
    }))
  );

// Handle potential errors during image insertion
if (imageInsertError) {
  // Log detailed error information
  console.error('[PRODUCTS_POST_IMAGES] Error inserting images:', {
    productId: product.id,
    images: images,
    error: imageInsertError,
  });

  // Return a server error response
  return new NextResponse("Internal error while inserting images", {
    status: 500,
  });
}

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCTS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  console.log('API Route - Received request:', {
    url: req.url,
    method: req.method,
    storeId: params.storeId
  });
  console.log('Starting the product fetch process...');
  try {
    // Parse the request URL and retrieve search params
    const { searchParams } = new URL(req.url);
    const isFeatured = searchParams.get('is_featured');

    // Ensure storeId is provided
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // Start building the query
    let query = supabase
      .from('products')
      .select(`
        *
      `)
      .eq('store_id', params.storeId)
      // .eq('is_archived', false) // Ensure we don't return archived products
      .order('created_at', { ascending: false });

    // Only add the `is_featured` filter if it is defined
    if (isFeatured !== null) {
      query = query.eq('is_featured', isFeatured === 'true');
    }

    // Execute the query and log the result
    const { data: products, error } = await query;

    // Check for errors and handle accordingly
    if (error) {
      console.error('[PRODUCTS_GET] Error fetching products:', error.message);
      return new NextResponse("Internal error fetching products", { status: 500 });
    }

    // Log the retrieved products for debugging
    console.log('[PRODUCTS_GET] Fetched products:', products);

    // Return the fetched products as JSON
    return NextResponse.json(products);
  } catch (error) {
    console.error('[PRODUCTS_GET] Unexpected error:', error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
