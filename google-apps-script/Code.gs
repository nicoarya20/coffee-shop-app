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
 * 8. Who has access: "Anyone"
 * 9. Click "Deploy"
 * 10. Copy the Web App URL to .env as GOOGLE_APPS_SCRIPT_URL
 */

// Option 1: Use specific folder ID (recommended if folder already exists)
const FOLDER_ID = "1TGBM3D-RnQRMiJks8pxPvEXyoSjAtwtY"; // Your existing folder ID

// Option 2: Use folder name (creates new if not found)
const FOLDER_NAME = "Coffe-Shop-Product"; // Your folder name

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
    
    // Get folder (by ID first, then by name as fallback)
    const folder = getFolder();
    
    // Decode base64 file data
    const fileData = Utilities.base64Decode(data.fileData);
    const blob = Utilities.newBlob(fileData, data.mimeType || 'application/octet-stream', data.fileName);
    
    // Create file in folder
    const file = folder.createFile(blob);
    
    // Set file to public - ANYONE can view (not just with link)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Also add "anyone" permission explicitly for extra compatibility
    try {
      file.addEditor(Session.getActiveUser().getEmail());
    } catch (e) {
      Logger.log('Could not add editor: ' + e.toString());
    }
    
    // Get file ID
    const fileId = file.getId();
    
    // Generate multiple URL formats for compatibility
    // Primary: direct view URL
    const fileUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
    
    // Alternative formats (for reference)
    const downloadUrl = 'https://drive.google.com/uc?export=download&id=' + fileId;
    const webViewUrl = 'https://drive.google.com/file/d/' + fileId + '/view';
    const directLinkUrl = 'https://lh3.googleusercontent.com/d/' + fileId;
    
    Logger.log('File uploaded: ' + file.getName() + ' (ID: ' + fileId + ')');
    Logger.log('File URL: ' + fileUrl);
    Logger.log('Web View URL: ' + webViewUrl);
    Logger.log('Direct Link URL: ' + directLinkUrl);
    
    // Return success response with all URL formats
    return jsonResponse({
      success: true,
      fileId: fileId,
      fileUrl: fileUrl,
      webViewUrl: webViewUrl,
      downloadUrl: downloadUrl,
      directLinkUrl: directLinkUrl
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
    folderId: FOLDER_ID,
    folderName: FOLDER_NAME,
    timestamp: new Date().toISOString()
  });
}

/**
 * Get folder by ID or name
 */
function getFolder() {
  // Try to get folder by ID first
  if (FOLDER_ID && FOLDER_ID.trim() !== '') {
    try {
      const folder = DriveApp.getFolderById(FOLDER_ID);
      Logger.log('Using folder by ID: ' + folder.getName() + ' (ID: ' + folder.getId() + ')');
      return folder;
    } catch (e) {
      Logger.log('Folder ID not found: ' + FOLDER_ID);
    }
  }
  
  // Fallback: search by name
  if (FOLDER_NAME && FOLDER_NAME.trim() !== '') {
    const folders = DriveApp.getFoldersByName(FOLDER_NAME);
    if (folders.hasNext()) {
      const folder = folders.next();
      Logger.log('Using folder by name: ' + folder.getName() + ' (ID: ' + folder.getId() + ')');
      return folder;
    }
  }
  
  // Last resort: create new folder
  const folder = DriveApp.createFolder(FOLDER_NAME);
  Logger.log('Created new folder: ' + folder.getName() + ' (ID: ' + folder.getId() + ')');
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
