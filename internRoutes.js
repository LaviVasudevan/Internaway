// internRoutes.js
import express from "express";
import { getInternDetailsByRegNo, updateInternDetails } from "../service/sheetsService.js";

const router = express.Router();

router.get("/:regNumber", async (req, res) => {
  try {
    const data = await getInternDetailsByRegNo(req.params.regNumber);
    if (!data) return res.status(404).send("Student not found");
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data");
  }
});

router.put("/update", async (req, res) => {
  try {
    const { regnumber, ...updates } = req.body;
    await updateInternDetails(regnumber, updates);
    res.send("Updated successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating data");
  }
});

export default router;
