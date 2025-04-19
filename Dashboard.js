import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const staticFields = [
  "register_number",
  "name",
  "title",
  "mobile_no",
  "section"
];

const hiddenFields = [
  "signed_permission_letter_offer_letter",
  "completion_certificte",
  "internship_report",
  "student_feedback",
  "employer_feedback",
  "verification_status",
  "email",
  "s_no",
  "title"
];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [internData, setInternData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setUser(data);
          console.log("Step - 1");

          await fetch("http://localhost:5000/api/folder/prepare-internship-folder", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              regNumber: data.regNumber,
              year: data.year,
            }),
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.regNumber) {
      const token = localStorage.getItem("token");

      axios
        .get(`http://localhost:5000/api/folder/internships/${user.regNumber}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setInternData(res.data);
          setEditableData(res.data);
        })
        .catch((err) => console.error("Intern data error:", err));
    }
  }, [user]);

  const handleChange = (key, value) => {
    setEditableData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/folder/internship/details",
        editableData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setIsEditing(false);
      setInternData(editableData);
    } catch (error) {
      console.error("Failed to save updated data:", error);
    }
  };

  const exportToCSV = () => {
    const visibleData = Object.entries(internData)
      .filter(([key]) => !hiddenFields.includes(key))
      .reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {});

    const csvContent =
      "data:text/csv;charset=utf-8," +
      Object.keys(visibleData).join(",") +
      "\n" +
      Object.values(visibleData).join(",");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "internship_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user || !internData) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "2rem", backgroundColor: "#ffffff" }}>
      <h1 style={{ textAlign: "center", fontSize: "2.5rem", color: "#007bff" }}>
        InternAway
      </h1>
      <table style={{ borderCollapse: "collapse", width: "100%", backgroundColor: "white" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={cellStyle}>Field</th>
            <th style={cellStyle}>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(editableData)
            .filter(([key]) => !hiddenFields.includes(key))
            .map(([key, value]) => (
              <tr key={key}>
                <td style={cellStyle}>{key}</td>
                <td style={cellStyle}>
                  {staticFields.includes(key) ? (
                    <span>{value}</span>
                  ) : isEditing ? (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      style={{ width: "100%", padding: "4px" }}
                    />
                  ) : (
                    <span>{value}</span>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {isEditing ? (
          <button onClick={handleSave} style={buttonStyle}>Save</button>
        ) : (
          <button onClick={() => setIsEditing(true)} style={buttonStyle}>Edit</button>
        )}
        <button onClick={() => navigate("/files")} style={buttonStyle}>Files</button>
        <button onClick={exportToCSV} style={buttonStyle}>Export</button>
      </div>
    </div>
  );
};

const cellStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "left",
};

const buttonStyle = {
  padding: "8px 16px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default Dashboard;
