import React from "react";
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { HomePage } from "./HomePage";
import { DashboardPage } from "./DashboardPage";
import { SignUpDetailsPage } from "./SignUpDetailsPage";
import { RedirectToDashboard } from "./RedirectToDashboard";
import { RedirectToRole } from "./RedirectToRole";
import { VendorDashboard } from "./VendorDashboard";
import { CustomerDashboard } from "./CustomerDashboard";
import { ProtectedRoute } from "./ProtectedRoute";
import { RentalOrderPage } from "./RentalOrderPage";
import ProductRegistrationPage from "./ProductRegistrationPage";
import VendorProductsPage from "./VendorProductsPage";
import ProductDetailPage from "./ProductDetailPage";
import CartScreen from "./CartDetails";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RedirectToRole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor"
          element={
            <ProtectedRoute>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
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
        <Route
          path="RentalOrderPage/:orderId"
          element={
            <ProtectedRoute>
              <RentalOrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/register"
          element={
            <ProtectedRoute>
              <ProductRegistrationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/products"
          element={
            <ProtectedRoute>
              <VendorProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:productId"
          element={
            <ProtectedRoute>
              <ProductDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartScreen />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<RedirectToDashboard />} />
    </Routes>
  );
}
