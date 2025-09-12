import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const { file, folder, transformation } = await req.json();
    
    if (!file) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }
    
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(file, {
      folder: folder || "o_n_b_apparels/profiles",
      transformation: transformation || [
        { width: 500, height: 500, crop: "limit" },
        { quality: "auto" }
      ]
    });
    
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error: any) {
    console.error("Error uploading image to Cloudinary:", error);
    return NextResponse.json(
      { error: error.message || "Error uploading image" },
      { status: 500 }
    );
  }
}
