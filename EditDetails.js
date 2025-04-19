import React, { useEffect, useState } from "react";
import axios from "axios";

const EditDetails = () => {
  const [formData, setFormData] = useState({
    regNumber: "",
    name: "",
    section: "",
    mobileNo: "",
    obtained: "",
    duration: "",
    startDate: "",
    endDate: "",
    company: "",
    source: "",
    mode: "",
    stipend: "",
    type: "",
    location: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Step 1: Get current logged-in user's regNumber
        const userRes = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const regNumber = userRes.data.regNumber;

        // Step 2: Get intern details using backend endpoint
        const internRes = await axios.get(`/api/intern/${regNumber}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setFormData(internRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/api/intern/update", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      alert("Details updated to Google Sheets!");
    } catch (err) {
      console.error(err);
      alert("Failed to update.");
    }
  };

  return (
    <div className="container">
      <h2>Edit Internship Details</h2>
      <form onSubmit={handleSubmit}>
        {/* Static fields */}
        <fieldset disabled>
          <div>
            <label>Registration Number:</label>
            <input value={formData.regNumber} readOnly />
          </div>
          <div>
            <label>Name:</label>
            <input value={formData.name} readOnly />
          </div>
          <div>
            <label>Mobile Number:</label>
            <input value={formData.mobileNo} readOnly />
          </div>
          <div>
            <label>Section:</label>
            <input value={formData.section} readOnly />
          </div>
        </fieldset>

        {/* Editable fields */}
        <div>
          <label>Obtained Internship:</label>
          <select name="obtained" value={formData.obtained} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label>Duration:</label>
          <input name="duration" value={formData.duration} onChange={handleChange} />
        </div>

        <div>
          <label>Start Date:</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
        </div>

        <div>
          <label>End Date:</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
        </div>

        <div>
          <label>Company Name:</label>
          <input name="company" value={formData.company} onChange={handleChange} />
        </div>

        <div>
          <label>Through:</label>
          <select name="source" value={formData.source} onChange={handleChange}>
            <option value="">Select</option>
            <option value="CDC">CDC</option>
            <option value="Department">Department</option>
          </select>
        </div>

        <div>
          <label>Mode:</label>
          <select name="mode" value={formData.mode} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label>Stipend:</label>
          <input name="stipend" value={formData.stipend} onChange={handleChange} />
        </div>

        <div>
          <label>Internship Type:</label>
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Industry">Industry</option>
            <option value="Research">Research</option>
          </select>
        </div>

        <div>
          <label>Internship Location:</label>
          <select name="location" value={formData.location} onChange={handleChange}>
            <option value="">Select</option>
            <option value="India">India</option>
            <option value="Abroad">Abroad</option>
          </select>
        </div>

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditDetails;
