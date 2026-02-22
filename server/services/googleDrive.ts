/**
 * Upload file to Google Drive via Google Apps Script
 * 
 * This uses Google Apps Script as a middleware to upload files
 * to your personal Google Drive (since Service Accounts cannot
 * upload to personal Drive without Shared Drive).
 */

const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

if (!GOOGLE_APPS_SCRIPT_URL) {
  console.warn('⚠️  GOOGLE_APPS_SCRIPT_URL not configured. File upload will not work.');
  console.warn('📝 See google-apps-script/README.md for setup instructions');
}

export interface UploadResult {
  success: boolean;
  fileId?: string;
  fileUrl?: string;
  webViewUrl?: string;
  error?: string;
}

/**
 * Upload a file to Google Drive via Google Apps Script
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
    if (!GOOGLE_APPS_SCRIPT_URL) {
      return {
        success: false,
        error: 'GOOGLE_APPS_SCRIPT_URL not configured. See google-apps-script/README.md for setup.',
      };
    }

    // Convert buffer to base64
    const fileData = buffer.toString('base64');

    // Prepare request body
    const requestBody = {
      fileData,
      fileName: `${Date.now()}-${filename}`,
      mimeType,
    };

    // Send request to Google Apps Script
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to upload file',
      };
    }

    return {
      success: true,
      fileId: result.fileId,
      fileUrl: result.fileUrl,
      webViewUrl: result.webViewUrl,
    };
  } catch (error: any) {
    console.error('Google Apps Script upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file to Google Drive',
    };
  }
}

/**
 * Delete a file from Google Drive (not supported via Apps Script)
 * @param fileId - Google Drive file ID
 */
export async function deleteFile(fileId: string): Promise<{ success: boolean; error?: string }> {
  // Deletion is not implemented in the Apps Script
  // You can manually delete files from Google Drive
  return { 
    success: false, 
    error: 'File deletion not supported. Please delete manually from Google Drive.' 
  };
}

/**
 * Get file URL from file ID (not applicable for Apps Script)
 * @param fileId - Google Drive file ID
 */
export function getFileUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}
