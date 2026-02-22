/**
 * Google Apps Script - Upload File to Google Drive
 * 
 * Setup Instructions:
 * 1. Go to https://script.google.com/
 * 2. Click "New Project"
 * 3. Paste this code
 * 4. Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 * 6. Description: "Coffee Shop Upload API"
 * 7. Execute as: "Me"
 * 8. Who has access: "Anyone" (or "Anyone with Google account")
 * 9. Click "Deploy"
 * 10. Copy the Web App URL to .env as GOOGLE_APPS_SCRIPT_URL
 */

const FOLDER_NAME = "Coffee Shop Products"; // Folder name in your Drive

/**
 * Handle POST requests - Upload file
 */
function doPost(e) {
  try {
    // Parse the request
    const data = JSON.parse(e.postData.contents);
    
    if (!data || !data.fileData || !data.fileName) {
      return jsonResponse({
        success: false,
        error: 'Missing fileData or fileName in request body'
      }, 400);
    }
    
    // Get or create upload folder
    const folder = getOrCreateFolder();
    
    // Decode base64 file data
    const fileData = Utilities.base64Decode(data.fileData);
    const blob = Utilities.newBlob(fileData, data.mimeType || 'application/octet-stream', data.fileName);
    
    // Create file in Drive
    const file = folder.createFile(blob);
    
    // Set file to public (anyone with link can view)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Get file URL
    const fileUrl = file.getDownloadUrl();
    
    // Return success response
    return jsonResponse({
      success: true,
      fileId: file.getId(),
      fileUrl: fileUrl,
      webViewUrl: file.getUrl()
    });
    
  } catch (error) {
    Logger.log('Upload error: ' + error.toString());
    return jsonResponse({
      success: false,
      error: error.toString()
    }, 500);
  }
}

/**
 * Handle GET requests - Health check
 */
function doGet(e) {
  return jsonResponse({
    success: true,
    message: 'Coffee Shop Upload API is running',
    timestamp: new Date().toISOString()
  });
}

/**
 * Get or create folder for uploads
 */
function getOrCreateFolder() {
  // Search for existing folder
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  
  if (folders.hasNext()) {
    return folders.next();
  }
  
  // Create new folder if not found
  const folder = DriveApp.createFolder(FOLDER_NAME);
  Logger.log('Created folder: ' + folder.getName() + ' (ID: ' + folder.getId() + ')');
  return folder;
}

/**
 * Helper function to return JSON response
 */
function jsonResponse(data, statusCode) {
  statusCode = statusCode || 200;
  
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle preflight OPTIONS request for CORS
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
