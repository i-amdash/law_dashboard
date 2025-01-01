import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *
      `)
      .eq('id', params.productId)
      .single();

    if (error) {
      console.error('[PRODUCT_GET]', error);
      return new NextResponse("Internal error", { status: 500 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', params.storeId)
      .eq('user_id', userId)
      .single();

    if (storeError || !store) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const { data: product, error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.productId)
      .single();

    if (error) {
      console.error('[PRODUCT_DELETE]', error);
      return new NextResponse("Internal error", { status: 500 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}


export async function PATCH(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { name, price, description, images, isFeatured, isSold, isArchived } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
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

    // Check if the user owns the store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', params.storeId)
      .eq('user_id', userId)
      .single();

    if (storeError || !store) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    // Update the product first
    const { error: updateError } = await supabase
      .from('products')
      .update({
        name,
        price,
        description,
        images,
        is_featured: isFeatured,
        is_sold: isSold,
        is_archived: isArchived,
      })
      .eq('id', params.productId);

    if (updateError) {
      console.error('[PRODUCT_PATCH]', updateError);
      return new NextResponse("Internal error", { status: 500 });
    }

    // Clear existing images
    await supabase
      .from('images')
      .delete()
      .eq('product_id', params.productId);

    // Insert new images
    const { error: imageInsertError } = await supabase
      .from('images')
      .insert(images.map((image: { url: string }) => ({
        product_id: params.productId,
        url: image.url,
      })));

    if (imageInsertError) {
      console.error('[PRODUCT_PATCH_IMAGES]', imageInsertError);
      return new NextResponse("Internal error", { status: 500 });
    }

    // Fetch the updated product
    const { data: updatedProduct, error: fetchError } = await supabase
      .from('products')
      .select(`
        *
      `)
      .eq('id', params.productId)
      .single();

    if (fetchError) {
      console.error('[PRODUCT_FETCH]', fetchError);
      return new NextResponse("Internal error", { status: 500 });
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('[PRODUCT_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
