import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/RowDetails.css";

const RowDetails = ({ data, year }) => {
  const { index } = useParams();
  const navigate = useNavigate();

  const entry = data[parseInt(index)];
  const SHEET_ID = process.env[`REACT_APP_SPREADSHEET_ID_Y${year}`];
  const SHEET_NAME = process.env[`REACT_APP_SHEET_NAME_Y${year}`];

  const [status, setStatus] = useState(entry?.["Verification Status"] || "");
  const [remarks, setRemarks] = useState(entry?.["Remarks"] || "");
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const sno = entry["S.No"];
  const name = entry["Name"];
  const regNumber = entry["Register Number"];

  const entries = Object.entries(entry).filter((_, i) => i !== 0 && i !== 3);
  const section1 = entries.slice(0, 4);
  const section2 = entries.slice(4, 13);

  useEffect(() => {
    const fetchFiles = async () => {
      const yearMap = { "1": "i", "2": "ii", "3": "iii", "4": "iv" };
      const yearSlug = yearMap[year?.toString()] || year?.toLowerCase();
      try {
        const res = await fetch(
          `http://localhost:5000/drive/list-student-files?year=${yearSlug}&name=${encodeURIComponent(
            name
          )}&regNumber=${regNumber}`
        );
        const json = await res.json();
        if (json.success) setUploadedFiles(json.files || []);
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    };
    if (name && regNumber) fetchFiles();
  }, [name, regNumber, year]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!sno) return alert("Missing S.No.");
    const row = parseInt(sno) + 1;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetId: SHEET_ID,
          sheetName: SHEET_NAME,
          rowNumber: row,
          status,
          remarks,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        alert("Verification status updated successfully.");
        navigate(-1);
      } else {
        throw new Error(result.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update verification status.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const payload = {
      name: entry["Name"],
      internship: entry["Title"],
      startDate: entry["Start Date"],
      endDate: entry["End Date"],
      company: entry["Company Name"],
      fileUrl: uploadedFiles[0]?.url || "",
    };
    console.log(uploadedFiles[0]?.url);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        const matches = result.matches || {};
        const allMatched = Object.values(matches).every((v) => v === true);
        if (allMatched) {
          alert("Verified")
        } else {
          alert("Verification done, but fields didn’t fully match.");
        }
      } else {
        alert("Verification failed.");
        console.error(result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error verifying.");
    }
  };

  const renderSection = (section, title) => (
    <div className="section">
      <h3>{title}</h3>
      {section.map(([key, value], idx) => (
        <div className="form-field" key={idx}>
          <label>{key}</label>
          <input type="text" value={value} readOnly />
        </div>
      ))}
    </div>
  );

  const renderUploadedFiles = () => (
    <div className="section">
      <h3>Uploaded Documents</h3>
      {uploadedFiles.length > 0 ? (
        uploadedFiles.map((file, idx) => {
          const displayText = file.label || file.name || `File ${idx + 1}`;
          return (
            <div className="form-field" key={idx}>
              <div className="file-display">
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {displayText}
                </a>
              </div>
            </div>
          );
        })
      ) : (
        <p>No files uploaded.</p>
      )}
    </div>
  );

  if (!entry) return <p>Data not found.</p>;

  return (
    <div className="row-details">
      <h2>Internship Details</h2>
      <form onSubmit={handleSave}>
        {renderSection(section1, "Basic Info")}
        {renderSection(section2, "Internship Details")}
        {renderUploadedFiles()}
        <div className="verification-section">
          <label>Verification Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Select</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
          <div className="form-field">
            <label>Remarks (Optional)</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks if any..."
            />
          </div>
          <button type="submit" className="save-button" disabled={loading}>
            {loading ? "Saving..." : "Update Status"}
          </button>
        </div>
      </form>
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleVerify} className="verify-button">
          Verify
        </button>
      </div>
    </div>
  );
};

export default RowDetails;
