import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
    year: "",
    regNumber: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "role" && value === "admin"
        ? { year: "admin", regNumber: "" }
        : value === "student"
        ? { year: "", regNumber: "" }
        : {}),
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const dataToSend = {
      email: formData.email,
      password: formData.password,
      year: formData.role === "admin" ? "admin" : formData.year,
      regNumber: formData.regNumber,
    };

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful! Please log in.");
        navigate("/");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Register Error:", err);
      alert("An error occurred. Please check the console.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 style={{ textAlign: "center", fontSize: "2.5rem", color: "#007bff" }}>
          InternAway
        </h1>
        <h3 style={{ textAlign: "center", color: "#555", marginBottom: "2rem" }}>
          Sign up and get started!
        </h3>
        <form onSubmit={handleRegister} className="form">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            className="input"
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>

          {formData.role === "student" && (
            <>
              <input
                type="text"
                name="year"
                placeholder="Year of study (e.g. III)"
                value={formData.year}
                onChange={handleChange}
                className="input"
                required
              />
              <input
                type="text"
                name="regNumber"
                placeholder="Registration Number"
                value={formData.regNumber}
                onChange={handleChange}
                className="input"
                required
              />
            </>
          )}

          {formData.role === "admin" && (
            <input
              type="text"
              name="regNumber"
              placeholder="Admin ID"
              value={formData.regNumber}
              onChange={handleChange}
              className="input"
              required
            />
          )}

          <button type="submit" className="btn">
            REGISTER
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn signup"
          >
            Already have an account? Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
