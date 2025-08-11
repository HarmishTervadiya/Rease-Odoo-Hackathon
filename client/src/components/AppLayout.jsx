import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        <Outlet /> {/* Child routes will render here */}
      </main>
    </div>
  );
}
