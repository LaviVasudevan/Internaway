// App.js
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Files from "./pages/Files";
import EditDetails from "./pages/EditDetails";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Home from "./pages/Home";
import SidePanel from "./pages/SidePanel";
import PrivateRoute from "./pages/PrivateRoute";

import CoordinatorSheet from "./components/CoordinatorSheet";
import RowDetails from "./components/RowDetails";
import "./App.css";

// Wrapper to use hooks with Router
const RowDetailsWrapper = ({ data }) => {
  const { index } = useParams();
  return <RowDetails data={data} index={index} year="2" />;
};

const AdminHome = () => {
  const navigate = useNavigate();

  const batches = [
    { label: "Batch 2021-2025", year2: "2", year3: "3" },
    { label: "Batch 2022-2026", year2: "2", year3: "3" },
    { label: "Batch 2023-2027", year2: "2", year3: "3" },
  ];

  return (
    <div className="home">
      <div className="home-header">
      <h1 style={{ textAlign: "center", fontSize: "2.5rem", color: "#007bff" }}>
        InternAway
      </h1>
        <h1>Internship Dashboard</h1>
      </div>
      <div className="batch-list">
        {batches.map((batch, idx) => (
          <div key={idx} className="batch-card">
            <h2>{batch.label}</h2>
            <div className="year-buttons">
              <button onClick={() => navigate(`/year${batch.year2}`)}>2nd Year</button>
              <button onClick={() => navigate(`/year${batch.year3}`)}>3rd Year</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // "admin" or "student"
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const fetchUser = async () => {
      if (token) {
        try {
          const res = await fetch("http://localhost:5000/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const userData = await res.json();
          if (res.ok) {
            setUserRole(userData.year === "admin" ? "admin" : "student");
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
        }
      }
    };

    fetchUser();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/");
  };

  const hideSidebarPaths = ["/", "/signup"];
  const shouldShowSidebar =
    isLoggedIn &&
    userRole === "student" &&
    !hideSidebarPaths.includes(location.pathname);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Admin Logout Button (top-left) */}
      {isLoggedIn && userRole === "admin" && (
        <div style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 1000,
        }}>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 12px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexGrow: 1 }}>
        {shouldShowSidebar && <SidePanel />}
        <div style={{ marginLeft: shouldShowSidebar ? "200px" : "0", width: "100%" }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Register />} />

            {/* Student Routes */}
            <Route path="/home" element={<PrivateRoute element={<Home />} />} />
            <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
            <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
            <Route path="/files" element={<PrivateRoute element={<Files />} />} />
            <Route path="/edit-details" element={<PrivateRoute element={<EditDetails />} />} />

            {/* Admin Routes */}
            <Route path="/admin-home" element={<PrivateRoute element={<AdminHome />} />} />
            <Route path="/year2" element={<PrivateRoute element={<CoordinatorSheet year="2" onDataLoaded={setData} />} />} />
            <Route path="/year2/details/:index" element={<PrivateRoute element={<RowDetailsWrapper data={data} />} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
