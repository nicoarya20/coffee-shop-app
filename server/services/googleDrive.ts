import { google } from 'googleapis';
import { Readable } from 'stream';

const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID?.split('?')[0]; // Remove query params

if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_DRIVE_FOLDER_ID) {
  console.warn('⚠️  Google Drive credentials not configured. File upload will not work.');
  console.warn('📝 Please set GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_DRIVE_FOLDER_ID in .env');
}

// Initialize Google Drive API client
const getDriveClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_CLIENT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
};

export interface UploadResult {
  success: boolean;
  fileId?: string;
  fileUrl?: string;
  error?: string;
}

/**
 * Upload a file to Google Drive
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
    if (!GOOGLE_DRIVE_FOLDER_ID) {
      return {
        success: false,
        error: 'Google Drive folder ID not configured. Please set GOOGLE_DRIVE_FOLDER_ID in .env',
      };
    }

    const drive = getDriveClient();

    // Create a readable stream from the buffer
    const bufferStream = Readable.from(buffer);

    // Prepare file metadata
    const fileMetadata = {
      name: `${Date.now()}-${filename}`,
      parents: [GOOGLE_DRIVE_FOLDER_ID],
    };

    // Prepare media for upload
    const media = {
      mimeType,
      body: bufferStream,
    };

    // Upload file
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id',
    });

    const fileId = response.data.id;

    if (!fileId) {
      return {
        success: false,
        error: 'Failed to get file ID from Google Drive',
      };
    }

    // Make file publicly accessible (for viewing)
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Get the file URL
    const fileUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    return {
      success: true,
      fileId,
      fileUrl,
    };
  } catch (error: any) {
    console.error('Google Drive upload error:', error);
    
    // Handle specific error cases
    if (error.code === 404) {
      return {
        success: false,
        error: `Google Drive folder not found. Please check:\n1. Folder ID is correct: ${GOOGLE_DRIVE_FOLDER_ID}\n2. Folder is shared with service account: ${GOOGLE_CLIENT_EMAIL}\n3. Service account has Editor permission`,
      };
    }
    
    if (error.code === 403) {
      return {
        success: false,
        error: 'Permission denied. Please ensure the Google Drive folder is shared with the service account email with Editor permission.',
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to upload file to Google Drive',
    };
  }
}

/**
 * Delete a file from Google Drive
 * @param fileId - Google Drive file ID
 */
export async function deleteFile(fileId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const drive = getDriveClient();

    await drive.files.delete({ fileId });

    return { success: true };
  } catch (error: any) {
    console.error('Google Drive delete error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete file from Google Drive',
    };
  }
}

/**
 * Get file URL from file ID
 * @param fileId - Google Drive file ID
 */
export function getFileUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
