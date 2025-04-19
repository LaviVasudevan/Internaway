import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SidePanel = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div style={sidePanelStyle}>
            <ul style={menuStyle}>
                <li><Link to="/home" style={linkStyle}>Home</Link></li>
                <li><Link to="/profile" style={linkStyle}>Profile</Link></li>
                <li><Link to="/dashboard" style={linkStyle}>Edit Details</Link></li>
                <li><Link to="/files" style={linkStyle}>Manage Files</Link></li>
                <li onClick={handleLogout} style={logoutStyle}>Log out</li>
            </ul>
        </div>
    );
};

const sidePanelStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '200px',
    height: '100vh',
    backgroundColor: '#c3e49f',
    paddingTop: '2rem',
};

const menuStyle = {
    listStyleType: 'none',
    padding: 0,
};

const linkStyle = {
    display: 'block',
    padding: '1rem',
    textDecoration: 'none',
    color: '#000', // Changed to black
    fontSize: '1.2rem',
    transition: 'background-color 0.3s',
};

const logoutStyle = {
    display: 'block',
    padding: '1rem',
    textDecoration: 'none',
    color: '#000', // Changed to black
    fontSize: '1.2rem',
    cursor: 'pointer',
    backgroundColor: '#cfcfcf',
};

export default SidePanel;
