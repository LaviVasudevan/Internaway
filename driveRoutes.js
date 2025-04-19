import express from "express";
import multer from "multer";
import { uploadFile } from "../service/driveService.js"; 
import { ensureDriveFolderStructure } from "../service/driveService.js";
import User from "../models/User.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { regNumber, documentType } = req.body;

    if (!regNumber || !documentType) {
      return res.status(400).json({ error: "Missing regNumber or documentType" });
    }

    // Fetch user from DB to get year and name
    const user = await User.findOne({ regNumber });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { year, name } = user;

    // ✅ Ensure Google Drive folder structure exists
    const folderId = await ensureDriveFolderStructure(year, regNumber, name);

    // Create the desired file name and upload
    const fileName = `${regNumber}_${documentType}.pdf`;
    const fileId = await uploadFile(req.file.path, fileName, folderId);

    res.json({ success: true, fileId });
  } catch (error) {
    console.error("❌ Upload error:", error.message);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
