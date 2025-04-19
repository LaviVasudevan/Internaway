import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

import { Readable } from "stream";
export const checkIfFolderExists = async (year, regNumber) => {
  try {
    const batchFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

    // Use helper function to get the year folder
    const yearFolderId = await getFolderIdByName(`Year ${year}`, batchFolderId);

    // Use helper function to get the "Details" folder inside year
    const detailsFolderId = await getFolderIdByName("Details", yearFolderId);

    // Build student folder name pattern (you could change this to exact match if required)
    const studentFolderQuery = `mimeType='application/vnd.google-apps.folder' and name contains '${regNumber}' and '${detailsFolderId}' in parents and trashed = false`;

    const studentFolderRes = await drive.files.list({
      q: studentFolderQuery,
      fields: "files(id, name)",
    });

    if (studentFolderRes.data.files.length > 0) {
      return studentFolderRes.data.files[0].id;
    }

    return null;
  } catch (error) {
    console.error("❌ Error checking for existing folder:", error);
    return null;
  }
};

// Upload from in-memory buffer instead of disk
export const uploadFileFromBuffer = async (fileBuffer, fileName, folderId) => {
  const existingFiles = await drive.files.list({
    q: `'${folderId}' in parents and name = '${fileName}' and trashed = false`,
    fields: "files(id, name)",
  });

  // Delete existing files with same name
  for (const file of existingFiles.data.files) {
    await drive.files.delete({ fileId: file.id });
    console.log(`🗑️ Deleted existing file: ${file.name}`);
  }

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };
  const media = {
    mimeType: "application/pdf",
    body: Readable.from(fileBuffer),
  };

  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id",
    });
    console.log(`✅ Uploaded buffer file: ${fileName}`);
    return file.data.id;
  } catch (error) {
    console.error("❌ Error uploading buffer file:", error);
    throw error;
  }
};

// Upload a file to Drive inside a specific folder
// Upload a file to Drive inside a specific folder, replacing if duplicate exists
export const uploadFile = async (filePath, fileName, folderId) => {
  const existingFiles = await drive.files.list({
    q: `'${folderId}' in parents and name = '${fileName}' and trashed = false`,
    fields: "files(id, name)",
  });

  // Delete existing files with same name
  for (const file of existingFiles.data.files) {
    await drive.files.delete({ fileId: file.id });
    console.log(`🗑️ Deleted existing file: ${file.name}`);
  }

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };
  const media = {
    mimeType: "application/pdf",
    body: fs.createReadStream(filePath),
  };

  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id",
    });
    console.log(`✅ Uploaded file: ${fileName}`);
    return file.data.id;
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    throw error;
  }
};


// Get folder by name under given parentId
export const getFolderIdByName = async (folderName, parentId) => {
  const q = `'${parentId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const res = await drive.files.list({
    q,
    fields: "files(id, name)",
  });

  if (res.data.files.length > 0) {
    return res.data.files[0].id;
  } else {
    throw new Error(`❌ Folder "${folderName}" not found under parent ID: ${parentId}`);
  }
};

// Get or create student folder
export const getOrCreateStudentFolder = async (folderName, parentId) => {
  const q = `'${parentId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const res = await drive.files.list({
    q,
    fields: "files(id, name)",
  });

  if (res.data.files.length > 0) {
    console.log(`✅ Student folder exists: ${folderName}`);
    return res.data.files[0].id;
  }

  const folderMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentId],
  };

  const folder = await drive.files.create({
    resource: folderMetadata,
    fields: "id",
  });

  console.log(`📁 Student folder created: ${folderName}`);
  return folder.data.id;
};

// List files inside a specific folder
export const listFilesFromDrive = async (folderId) => {
  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, webViewLink)",
    });

    console.log(`📄 Found ${res.data.files.length} files in folder: ${folderId}`);
    return res.data.files;
  } catch (error) {
    console.error("❌ Error listing files from Drive:", error);
    throw error;
  }
};

export const deleteDriveFile = async (fileId) => {
  try {
    console.log(`Deleting file ${fileId}`)
    await drive.files.delete({ fileId });
    console.log(`🗑️ Deleted file with ID: ${fileId}`);
  } catch (error) {
    console.error("❌ Error deleting file:", error);
    throw error;
  }
};

// Only create student folder (predefined structure assured)
export const ensureDriveFolderStructure = async (year, regNumber, name) => {
  const batchFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

  // 1. Find Year X folder inside Internship_Batch 2022-2026
  const yearFolderId = await getFolderIdByName(`Year ${year}`, batchFolderId);

  // 2. Find Details folder inside Year X
  const detailsFolderId = await getFolderIdByName("Details", yearFolderId);
  if (!regNumber || !name) {
    throw new Error(`Invalid regNumber or name: ${regNumber}_${name}`);
  }
  
  // 3. Check or create student folder inside Details
  const studentFolderName = `${regNumber}_${name}`;
  console.log("From ensureDriveFolderStructure");
  console.log("Year folder ID:", yearFolderId);

  console.log("Details folder ID:", detailsFolderId);

  const studentFolderId = await getOrCreateStudentFolder(studentFolderName, detailsFolderId);

  return studentFolderId;
};
