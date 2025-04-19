import express from "express";
import multer from "multer";
import User from "../models/User.js";

import {
  ensureUserYearFolder
} from "../service/folderService.js";

import {
  getInternDetailsByRegNo,
  fetchStudentDetails,
  updateInternDetails
} from "../service/sheetsService.js";

import {
  ensureDriveFolderStructure,
  uploadFileFromBuffer,
  getOrCreateStudentFolder,
  listFilesFromDrive,
  deleteDriveFile
} from "../service/driveService.js";

import { authenticateUser as authenticateStudent } from "./authRoutes.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const PARENT_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

// Helper: Fetch user
const getUserByReg = async (regNumber) => await User.findOne({ regNumber });

// --- Prepare internship folder ---
router.post("/prepare-internship-folder", async (req, res) => {
  const { regNumber, year } = req.body;
  if (!regNumber || !year) return res.status(400).json({ error: "regNumber and year required" });

  try {
    const success = await ensureUserYearFolder(regNumber, year);
    success
      ? res.json({ success: true, message: "Folder is ready" })
      : res.status(500).json({ error: "Failed to prepare folder" });
    console.log("\nprepare-internship-folder - RETRIEVED\n");
    console.log("Received request to create folder for:", regNumber);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Get internship details ---
router.get("/internship/details", authenticateStudent, async (req, res) => {
  try {
    const regNumber = req.user.regNumber;
    const user = await getUserByReg(regNumber);
    if (!user) return res.status(404).json({ error: "User not found" });

    const details = await getInternDetailsByRegNo(regNumber, user.year);
    details
      ? res.json(details)
      : res.status(404).json({ error: "No data found" });
  } catch (err) {
    console.error("Error in /internship/details:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- Update internship details ---
router.post("/internship/details", authenticateStudent, async (req, res) => {
  try {
    const regNumber = req.user.regNumber;
    const updatedFields = req.body;

    const user = await getUserByReg(regNumber);
    if (!user) return res.status(404).json({ error: "User not found" });

    const result = await updateInternDetails(regNumber, updatedFields, user.year);
    res.json(result);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update" });
  }
});

// --- Upload file to drive ---
router.post("/internship/upload", authenticateStudent, upload.single("file"), async (req, res) => {
  try {
    const { fileType } = req.body;
    const regNumber = req.user.regNumber;
    const file = req.file;

    const user = await getUserByReg(regNumber);
    if (!user) return res.status(404).json({ error: "User not found in DB" });

    const studentDetails = await fetchStudentDetails(regNumber, user.year);
    if (!studentDetails) return res.status(404).json({ error: "Student not found in Google Sheets" });

    const folderId = await ensureDriveFolderStructure(user.year, regNumber, studentDetails.name);
    const sanitizedType = fileType.replace(/[^a-z0-9]/gi, "_");
    const filename = `${regNumber}_${sanitizedType}.pdf`;

    const fileId = await uploadFileFromBuffer(file.buffer, filename, folderId);
    res.json({ fileId });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

router.get("/drive/list-files", authenticateStudent, async (req, res) => {
  try {
    const regNumber = req.user.regNumber;

    const user = await getUserByReg(regNumber);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found in DB" });
    }

    const studentDetails = await fetchStudentDetails(regNumber, user.year);
    if (!studentDetails) {
      return res.status(404).json({ success: false, message: "Student not found in Google Sheets" });
    }

    const folderName = `${regNumber}_${studentDetails.name}`;
    const yearFolderName = `Year ${user.year}`;

    const yearFolderId = await getOrCreateStudentFolder(yearFolderName, PARENT_DRIVE_FOLDER_ID);
    const detailsFolderId = await getOrCreateStudentFolder("Details", yearFolderId);
    const folderId = await getOrCreateStudentFolder(folderName, detailsFolderId);

    const driveFiles = await listFilesFromDrive(folderId);

    const filesList = driveFiles
      .filter(file => file.name.startsWith(`${regNumber}_`))
      .map(file => {
        const label = file.name
          .replace(`${regNumber}_`, "")
          .replace(/_/g, " ")
          .replace(/\.pdf$/i, "");

        return {
          label,
          name: file.name,
          url: file.webViewLink,
          downloadUrl: `https://drive.google.com/uc?id=${file.id}&export=download`,
          id: file.id,
          createdTime: file.createdTime,
        };
      });

    return res.status(200).json({
      success: true,
      files: filesList,
      total: filesList.length,
    });

  } catch (err) {
    console.error("❌ Error listing files:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to list files",
      error: err.message,
    });
  }
});

router.delete("/drive/delete-file-by-id/:fileId", authenticateStudent, async (req, res) => {
  try {
    const { fileId } = req.params;
    console.log(`delte file ${fileId}`)
    await deleteDriveFile(fileId);
    return res.status(200).json({ success: true, message: `Deleted file: ${fileId}` });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete file", error: err.message });
  }
});


router.delete("/drive/delete-file/:label", authenticateStudent, async (req, res) => {
  try {
    const { label } = req.params;
    const regNumber = req.user.regNumber;

    const user = await getUserByReg(regNumber);
    const studentDetails = await fetchStudentDetails(regNumber, user.year);

    const folderName = `${regNumber}_${studentDetails.name}`;
    const yearFolderName = `Year ${user.year}`;
    const yearFolderId = await getOrCreateStudentFolder(yearFolderName, PARENT_DRIVE_FOLDER_ID);
    const detailsFolderId = await getOrCreateStudentFolder("Details", yearFolderId);
    const folderId = await getOrCreateStudentFolder(folderName, detailsFolderId);

    // Normalize the label to match upload/list logic
    const sanitizedLabel = label.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
    const fileName = `${regNumber}_${sanitizedLabel}.pdf`;

    const files = await listFilesFromDrive(folderId);
    const file = files.find(f => f.name === fileName);

    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    await deleteDriveFile(file.id);

    return res.status(200).json({
      success: true,
      message: `Deleted file: ${fileName}`,
      deletedFileId: file.id,
      deletedFileName: fileName,
    });

  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete file",
      error: err.message,
    });
  }
});


// --- Get internship details by regNumber (public) ---
router.get("/internships/:regNumber", async (req, res) => {
  try {
    const { regNumber } = req.params;
    const user = await getUserByReg(regNumber);
    if (!user) return res.status(404).json({ error: "User not found" });

    const internshipData = await getInternDetailsByRegNo(regNumber, user.year);
    internshipData
      ? res.json(internshipData)
      : res.status(404).json({ error: "Internship data not found" });
  } catch (err) {
    console.error("Error fetching internship data:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
