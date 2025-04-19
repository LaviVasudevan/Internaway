import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

const staticFields = ["register_number", "name", "title", "mobile_no", "section"];

const Profile = () => {
  const [user, setUser] = useState(null);
  const [internData, setInternData] = useState(null);

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
        })
        .catch((err) => console.error("Intern data error:", err));
    }
  }, [user]);

  if (!user || !internData) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "2rem", backgroundColor: "#f9f9f9", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <FaUserCircle size={100} color="#007bff" style={{ borderRadius: "50%", backgroundColor: "#e0e0e0" }} />
        <h2 style={{ margin: "0.5rem 0", color: "#007bff" }}>InternAway</h2>
        <p style={{ color: "#666" }}>Internship management made easier</p>
      </div>

      {staticFields.map((field) => (
        <div key={field} style={infoRow}>
          <span style={label}>{field.replace(/_/g, " ").toUpperCase()}</span>
          <span style={value}>{internData[field] || "—"}</span>
        </div>
      ))}
    </div>
  );
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "0.75rem 1rem",
  backgroundColor: "#fff",
  borderBottom: "1px solid #ddd",
};

const label = {
  fontWeight: "600",
  color: "#444",
};

const value = {
  color: "#222",
};

export default Profile;
