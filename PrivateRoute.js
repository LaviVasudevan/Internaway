import React from "react";
import { Route, Navigate } from "react-router-dom";

const PrivateRoute = ({ element, roleRequired }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" />;
  }

  const payload = JSON.parse(atob(token.split(".")[1]));
  if (payload.year !== roleRequired) {
    return <Navigate to="/home" />;
  }

  return element;
};

export default PrivateRoute;
