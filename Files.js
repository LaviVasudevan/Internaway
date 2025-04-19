import React, { useEffect, useState } from "react";
import axios from "axios";

const checklist = [
  "Signed Permission Letter",
  "Offer Letter",
  "Completion Certificate",
  "Internship Report",
  "Student Feedback",
  "Employer Feedback",
];

const formatFileName = (rawName) => {
  return rawName
    ?.replace(/^[^_]+_/, "")
    .replace(/_/g, " ")
    .replace(/\.pdf$/i, "");
};


const Files = () => {
  const [files, setFiles] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/folder/drive/list-files", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const filesArray = res.data.files || [];
      const filesObj = {};
  
      for (const file of filesArray) {
        filesObj[file.label] = file;
      }
  
      setFiles(filesObj); // now it matches your UI's expectation
      console.log(filesObj);
    } catch (error) {
      console.error("Error fetching files", error);
    }
  };
  

  const handleFileChange = (e, label) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [label]: e.target.files[0],
    }));
  };

  const handleUpload = async (fileType) => {
    const selectedFile = selectedFiles[fileType];
    if (!selectedFile) {
      alert("Please select a file before uploading.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileType", fileType);

      await axios.post("/api/folder/internship/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      fetchFiles(); // Refresh list
    } catch (error) {
      console.error("Upload error", error);
    }
  };

  const handleDelete = async (label) => {
    const file = files[label];
    if (!file) return;
  
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/folder/drive/delete-file-by-id/${file.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchFiles();
    } catch (err) {
      console.error("Delete error", err);
    }
  };
  

  return (
    
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", fontSize: "2.5rem", color: "#007bff" }}>
        InternAway
      </h1>
      
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={thStyle}>Document Type</th>
            <th style={thStyle}>File</th>
            <th style={thStyle}>Actions</th>
            <th style={thStyle}>Upload/Reupload</th>
          </tr>
        </thead>
        <tbody>
          {checklist.map((label) => {
            const stored = files[label];
            const fileName = formatFileName(stored?.name) || "Not Submitted";
            console.log(fileName)
            return (
              <tr key={label}>
                <td style={tdStyle}>{label}</td>
                <td style={tdStyle}>
                  {stored ? (
                    <a
                      href={stored.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      {fileName}
                    </a>
                  ) : (
                    "Not Submitted"
                  )}
                </td>
                <td style={tdStyle}>
                  {stored ? (
                    <>
                      <a
                        href={stored.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>{" "}
                      |{" "}
                      <button onClick={() => handleDelete(label)}>
                        Delete
                      </button>
                    </>
                  ) : (
                    "-"
                  )}
                </td>
                <td style={tdStyle}>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, label)}
                  />
                  <button onClick={() => handleUpload(label)}>
                    {stored ? "Reupload" : "Upload"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Styles
const thStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  fontWeight: "bold",
  textAlign: "center",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "center",
};

export default Files;
