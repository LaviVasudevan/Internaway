import { fetchStudentDetails } from "./sheetsService.js";
import { ensureDriveFolderStructure, checkIfFolderExists } from "./driveService.js";
import dotenv from "dotenv";

dotenv.config();

export const ensureUserYearFolder = async (regNumber, year) => {
  try {
    console.log(`Fetching details for: ${regNumber}`);
    const studentDetails = await fetchStudentDetails(regNumber, year);

    if (!studentDetails) {
      console.error(`No student found with RegNo: ${regNumber}`);
      return false;
    }

    const name = studentDetails.name?.trim() || "Unknown";
    console.log(`Student name: ${name}`);

    // Check if folder already exists
    const existingFolderId = await checkIfFolderExists(year, regNumber);
    if (existingFolderId) {
      console.log(`Folder already exists with ID: ${existingFolderId}`);
      return existingFolderId;
    }

    // Create folder if it doesn't exist
    const newFolderId = await ensureDriveFolderStructure(year, regNumber, name);
    console.log(`Google Drive folder created with ID: ${newFolderId}`);

    return newFolderId;
  } catch (error) {
    console.error("Error in ensureUserYearFolder:", error);
    return false;
  }
};
