// The cloudinary configuration is automatically handled by next-cloudinary
// via environment variables in .env file

/**
 * Uploads an image to Cloudinary
 * @param file Base64 encoded image string
 * @param options Upload options
 * @returns The upload result with secure URL and public ID
 */
export async function uploadToCloudinary(
  file: string,
  options: {
    folder?: string;
    transformation?: Array<Record<string, any>>;
  } = {}
): Promise<{ url: string; publicId: string }> {
  // Simulate direct upload since next-cloudinary doesn't expose direct upload API
  const response = await fetch('/api/cloudinary/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      file,
      ...options,
      folder: options.folder || 'o_n_b_apparels/profiles'
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload image to Cloudinary');
  }
  
  return await response.json();
}

const cloudinaryUtils = {
  upload: uploadToCloudinary
};

export default cloudinaryUtils;
