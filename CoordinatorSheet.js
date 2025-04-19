import React, { useEffect, useState } from "react";
import FilterPanel from "../pages/FilterPanel";
import TableDisplay from "../pages/TableDisplay";
import "../styles/TableDisplay.css";

const CoordinatorSheet = ({ year, onDataLoaded }) => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({});
  const [pendingStudents, setPendingStudents] = useState([]);
  const [rejectedStudents, setRejectedStudents] = useState([]);

  const API_KEY = process.env.REACT_APP_API_KEY;
  const SPREADSHEET_ID = process.env[`REACT_APP_SPREADSHEET_ID_Y${year}`];
  const SHEET_NAME = process.env[`REACT_APP_SHEET_NAME_Y${year}`];

  useEffect(() => {
    const fetchSheet = async () => {
      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(
            SHEET_NAME
          )}!A1:Z1000?key=${API_KEY}`
        );
        const json = await res.json();
        const rows = json.values;
        const headers = rows[0] || [];
        const entries = rows.slice(1).map((row) => {
          const fullRow = [...row, ...Array(headers.length - row.length).fill("")];
          return Object.fromEntries(headers.map((header, i) => [header, fullRow[i]]));
        });

        setData(entries);
        setFiltered(entries);
        if (onDataLoaded) onDataLoaded(entries);

        // Detect pending submissions
        const requiredField = headers[6] || ""; // Signed Permission or equivalent
        const checkFields = headers.slice(15, 20);
        const pending = entries.filter(
          (entry) =>
            entry[requiredField]?.toLowerCase() === "yes" &&
            checkFields.some((key) => entry[key]?.toLowerCase() === "no")
        );
        setPendingStudents(pending);

        // Detect rejected submissions
        const statusCol = headers[20] || "";
        const emailCol = headers[21] || "";
        const reasonCol = headers[22] || "";
        const rejected = entries.filter(
          (entry) => entry[statusCol]?.toLowerCase() === "rejected"
        );
        setRejectedStudents(
          rejected.map((entry) => ({
            name: entry["Name"],
            email: entry[emailCol],
            reason: entry[reasonCol],
          }))
        );
      } catch (err) {
        console.error("Error fetching sheet:", err);
      }
    };

    fetchSheet();
  }, [SPREADSHEET_ID, SHEET_NAME, API_KEY, onDataLoaded]);

  useEffect(() => {
    const result = data.filter((entry) =>
      Object.entries(filters).every(([key, value]) => {
        if (value === "") return true;
        if (key === "Duration of Internship") return entry[key] === value;
        return entry[key]?.toLowerCase().includes(value.toLowerCase());
      })
    );
    setFiltered(result);
  }, [filters, data]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const sendReminder = async () => {
    const allHeaders = data[0] ? Object.keys(data[0]) : [];
    const emailCol = allHeaders.find((h) => h.toLowerCase().includes("email")) || allHeaders.at(-1);
    const emails = pendingStudents.map((s) => s[emailCol]).filter(Boolean);

    try {
      const res = await fetch("http://localhost:8001/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });
      alert(res.ok ? "Reminder emails sent!" : "Failed to send reminders.");
    } catch (err) {
      console.error("Failed to send reminders:", err);
      alert("An error occurred while sending reminders.");
    }
  };

  const sendWarning = async () => {
    const warnings = rejectedStudents.map((s) => ({
      email: s.email,
      reason: s.reason || "Incorrect or mismatched document details",
    }));

    try {
      const res = await fetch("http://localhost:8001/send-warning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warnings }),
      });
      alert(res.ok ? "Warning emails sent!" : "Failed to send warnings.");
    } catch (err) {
      console.error("Failed to send warnings:", err);
      alert("An error occurred while sending warnings.");
    }
  };

  const allHeaders = data[0] ? Object.keys(data[0]) : [];

  return (
    <div className="container">
      <h1 style={{ textAlign: "center", fontSize: "2.5rem", color: "#007bff" }}>
        InternAway
      </h1>
      <h1>Year {year} Internship Details</h1>

      <div className="info-sections">
        {/* Pending Submissions */}
<div className="info-panel pending">
  <h2>Pending Document Uploads</h2>
  <div className="scroll-list">
    {pendingStudents.map((student, i) => {
      const emailCol = allHeaders.find((h) => h.toLowerCase().includes("email")) || allHeaders.at(-1);
      return (
        <div key={i} className="info-item">
          <span className="student-name">{student["Name"] || `Student ${i + 1}`}</span>
          <span className="student-email">{student[emailCol]}</span>
        </div>
      );
    })}
  </div>
  <div className="button-container">
    <button className="action-btn" onClick={sendReminder}>Send Reminder Mails</button>
  </div>
</div>

{/* Rejected Documents */}
<div className="info-panel rejected">
  <h2>Failed Document Verification</h2>
  <div className="scroll-list">
    {rejectedStudents.map((student, i) => (
      <div key={i} className="info-item">
        <span className="student-name">{student.name || `Student ${i + 1}`}</span>
        <span className="student-email">{student.email}</span>
        <span className="student-reason">Reason: {student.reason}</span>
      </div>
    ))}
  </div>
  <div className="button-container">
    <button className="action-btn" onClick={sendWarning}>Send Warning Mails</button>
  </div>
</div>

      </div>

      <FilterPanel headers={allHeaders} filters={filters} onFilterChange={handleFilterChange} />
      <TableDisplay headers={allHeaders} data={filtered} year={year} />
    </div>
  );
};

export default CoordinatorSheet;
