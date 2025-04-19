// useInternData.js
import { useState, useEffect } from "react";
import axios from "axios";

export const useInternData = () => {
  const [user, setUser] = useState(null);
  const [internData, setInternData] = useState(null);
  const [editableData, setEditableData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInternData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const userRes = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = userRes.data;
        setUser(userData);

        // Prepare internship folder on first login
        await axios.post(
          "/api/folder/prepare-internship-folder",
          {
            regNumber: userData.regNumber,
            year: userData.year,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const internRes = await axios.get(
          `/api/folder/internships/${userData.regNumber}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        setInternData(internRes.data);
        setEditableData(internRes.data);
      } catch (err) {
        console.error("Failed to fetch user or intern data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInternData();
  }, []);

  return {
    user,
    internData,
    editableData,
    setEditableData,
    setInternData,
    loading,
  };
};
