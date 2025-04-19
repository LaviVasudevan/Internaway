// External Packages
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import sheetRoutes from "./routes/sheetsRoutes.js";

// Local Files (These are perfect for your structure)
import userRoutes from "./routes/userRoutes.js";
import driveRoutes from "./routes/driveRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import internRoutes from "./routes/internRoutes.js";
import { connectDB } from "./config/db.js";
import "./service/authService.js"; // ✅ This one too
import { google } from "googleapis";
import fs from "fs";
const serviceAccount = JSON.parse(fs.readFileSync("./ipa1-451615-1c8b65779a93.json", "utf8"));
import studentDriveRoute from "./drive_access.js";

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"],
});

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();

// Middleware (Move these above session)
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Support form data
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(studentDriveRoute);

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/drive", driveRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/folder", folderRoutes);
app.use("/api/intern", internRoutes);
app.use("/api/sheets", sheetRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
