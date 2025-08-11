import React from "react";
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { HomePage } from "./HomePage";
import { DashboardPage } from "./DashboardPage";
import { SignUpDetailsPage } from "./SignUpDetailsPage";
import { RedirectToDashboard } from "./RedirectToDashboard";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sign-up-details"
          element={
            <ProtectedRoute>
              <SignUpDetailsPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<RedirectToDashboard />} />
    </Routes>
  );
}
