import React from "react";
import { Navigate } from "react-router-dom";
import { Auth } from "../services/auth";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  if (!Auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}