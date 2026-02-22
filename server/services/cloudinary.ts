import { v2 as cloudinary } from 'cloudinary';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn('⚠️  Cloudinary credentials not configured. File upload will not work.');
  console.warn('📝 Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  publicId?: string;
  error?: string;
}

/**
 * Upload a file to Cloudinary
 * @param buffer - File buffer
 * @param filename - Original filename
 * @param mimeType - File MIME type
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadResult> {
  try {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return {
        success: false,
        error: 'Cloudinary credentials not configured',
      };
    }

    // Convert buffer to base64
    const base64Data = buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'coffee-shop-products',
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' }, // Auto quality optimization
        { fetch_format: 'auto' }, // Auto format (WebP for supported browsers)
      ],
    });

    return {
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file to Cloudinary',
    };
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export async function deleteFile(publicId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return {
        success: false,
        error: 'Cloudinary credentials not configured',
      };
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return {
        success: false,
        error: 'Failed to delete file from Cloudinary',
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete file from Cloudinary',
    };
  }
}

/**
 * Get image URL from public ID
 * @param publicId - Cloudinary public ID
 */
export function getImageUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });
}
