import React from "react";
import { useInternData } from "./useInternData";

const Home = () => {
  const { internData, loading } = useInternData();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "#007bff" }}>
        InternAway
      </h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Manage your internships with ease.
      </p>

      {/* Personalized Greeting */}
      {internData && (
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ color: "#333", fontWeight: 500, fontSize:"2.5rem" }}>Hello, {internData.name}!</h2>
        </div>
      )}

      {/* Image below greeting */}
      <img 
        src="/assets/image.png"  // Change to your actual image path
        alt="Internship Illustration"
        style={{ width: "400px", height: "auto", marginBottom: "2rem" }}
      />
   
      <p style={{ color: "#333", fontSize: "2.0rem" }}>Let's get started</p>
      
      {loading && <p>Loading your data...</p>}
    </div>
  );
};

export default Home;
