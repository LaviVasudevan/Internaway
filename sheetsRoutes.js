// routes/sheetsRoutes.js
import express from "express";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";

const router = express.Router();

const getAuthClient = async () => {
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return await auth.getClient();
};

router.post("/update-status", async (req, res) => {
  const { sheetId, sheetName, rowNumber, status, remarks = "" } = req.body;

  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const statusCell = `R${rowNumber}C21`;
    const remarksCell = `R${rowNumber}C23`;

    await Promise.all([
      sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!${statusCell}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[status]] },
      }),
      sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!${remarksCell}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[remarks]] },
      }),
    ]);

    res.json({ message: "Status and remarks updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update sheet." });
  }
});

export default router;
