import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
router.post("/register", async (req, res) => {
  try {
    const { email, password, year, regNumber } = req.body;

    if (!email || !password || !year || !regNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const newUser = new User({
      email: email.toLowerCase(),
      password, // pass raw password — pre-save hook will hash it
      year,
      regNumber,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    // Lowercase the email before querying
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log(user);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Compare Hashed Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Wrong pwd - Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, regNumber: user.regNumber },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Include `year` in the response
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        year: user.year, // 👈 Added this line
      },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get Current User

const authenticateUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized - No Token" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ error: "Unauthorized - Invalid or Expired Token" });

      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized - Invalid Token" });
  }
};


//  Fix: Use Middleware
router.get("/me", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Load Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

// Fetch name from Google Sheets based on RegNo
const getNameFromGoogleSheet = async (regNumber) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:B", // Assuming RegNo is in column A and Name in column B
    });

    const rows = response.data.values;
    if (!rows) return null;

    for (const row of rows) {
      if (row[0] === regNumber) {
        return row[1]; // Return the corresponding Name
      }
    }

    return null; // No match found
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
    return null;
  }
};

export default router;
export { authenticateUser };
