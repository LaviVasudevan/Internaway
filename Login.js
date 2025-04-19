import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaInstagram, FaTwitter } from "react-icons/fa";
import "../styles/Login.css"; // Ensure your styles are correctly applied

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Making the API call for login
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // Store the JWT token in localStorage
        localStorage.setItem("token", data.token);

        // Fetch user details using the token
        const userRes = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
        });

        const userData = await userRes.json();

        if (userRes.ok) {
          // Redirect based on the user role
          const userRole = userData.year === "admin" ? "/admin-home" : "/home";
          navigate(userRole);  // Navigate to the respective home page
        } else {
          alert(userData.message || "Unable to fetch user details");
        }
      } else {
        // Login failed, show alert
        alert(data.error || data.message || "Login failed");
      }
    } catch (err) {
      // Catch and log any errors during the login process
      console.error("Login Error:", err);
      alert("Login error. Check console.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 style={{ textAlign: "center", fontSize: "2.5rem", color: "#007bff" }}>
          InternAway
        </h1>
        <h3 style={{ textAlign: "center", color: "#555", marginBottom: "2rem" }}>
          Internship management made easier
        </h3>
        <form onSubmit={handleLogin} className="form">
          <input
            type="email"
            placeholder="Enter Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />
          <button type="submit" className="btn">Login</button>
          <button
            type="button"
            onClick={() => alert("Google Sign-In not implemented")}
            className="btn google"
          >
            Sign-In using Google
          </button>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="btn signup"
          >
            Sign-Up
          </button>
        </form>

        <div className="social-icons">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="icon" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="icon" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
