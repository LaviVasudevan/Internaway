import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const SHEET_NAME = "Sheet1";
const RANGE = `${SHEET_NAME}!A1:Z1000`;

const getAuth = async () => {
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return await auth.getClient();
};

const sheets = google.sheets("v4");

const getSheetIdByYear = (year) => {
  if (year === "2" || year === "II") {
    return process.env.GOOGLE_SHEET_ID_YEAR_2;
  } else if (year === "3" || year === "III") {
    return process.env.GOOGLE_SHEET_ID_YEAR_3;
  } else {
    throw new Error("Unsupported year: " + year);
  }
};

// Fetch basic student info
export const fetchStudentDetails = async (regNumber, year) => {
  try {
    const sheetId = getSheetIdByYear(year);
    const auth = await getAuth();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A2:C`,
      auth,
    });

    const rows = response.data.values;
    const student = rows.find((row) => row[1] === regNumber);
    if (!student) return null;

    return {
      serialNumber: student[0],
      regNumber: student[1],
      name: student[2],
    };
  } catch (error) {
    console.error("Error fetching student details:", error);
    return null;
  }
};

// Utility: Normalize header keys
const normalizeKey = (key) => {
  return key
    .toLowerCase()
    .replace(/[\n\r]/g, '')        // remove newlines
    .replace(/[()]/g, '')          // remove parentheses
    .replace(/[^a-z0-9]+/g, '_')   // replace non-alphanumerics with _
    .replace(/^_+|_+$/g, '');      // trim underscores
};

// Get internship details (same sheet, same year logic)
export const getInternDetailsByRegNo = async (regNumber, year) => {
  try {
    const sheetId = getSheetIdByYear(year);
    const auth = await getAuth();

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: RANGE,
      auth,
    });

    const headers = sheetData.data.values[0];
    console.log("Headers from sheet:", headers);

    const rows = sheetData.data.values.slice(1);

    const regIndex = headers.findIndex(h => normalizeKey(h) === "register_number");
    const targetRow = rows.find(row => row[regIndex] === regNumber);

    if (!targetRow) {
      console.log("No matching registration number found in sheet for:", regNumber);
      return null;
    }

    const result = {};
    headers.forEach((header, i) => {
      result[normalizeKey(header)] = targetRow[i] || "";
    });

    // Log the result for debugging
    console.log("Internship details found:", result);

    return result;
  } catch (error) {
    console.error("Error fetching internship details:", error);
    return null;
  }
};



// Update internship details in the same year-based sheet
export const updateInternDetails = async (regNumber, updates, year) => {
  try {
    const sheetId = getSheetIdByYear(year);
    const auth = await getAuth();

    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: RANGE,
      auth,
    });

    const headers = sheetData.data.values[0];
    const rows = sheetData.data.values.slice(1);

    const rowIndex = rows.findIndex(
      (row) => row[headers.indexOf("Register Number")] === regNumber
    );
    if (rowIndex === -1) throw new Error("Registration number not found.");

    const targetRowNumber = rowIndex + 2;
    const rowToUpdate = sheetData.data.values[rowIndex + 1];
    const updatedRow = [...rowToUpdate];

    headers.forEach((header, colIndex) => {
      const key = header.replace(/\s/g, '').toLowerCase();
      if (updates[key] !== undefined) {
        updatedRow[colIndex] = updates[key];
      }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A${targetRowNumber}:Z${targetRowNumber}`,
      valueInputOption: "RAW",
      auth,
      requestBody: {
        values: [updatedRow],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating internship details:", error);
    return { success: false };
  }
};
