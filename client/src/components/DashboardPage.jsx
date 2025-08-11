import React, { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { BoxIcon, SearchIcon } from "./Icons";
import { useNavigate } from "react-router-dom";
export function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is loaded and signed in, but has no phone number in metadata, redirect.
    if (isLoaded && isSignedIn && !user.publicMetadata.phoneNumber) {
      navigate("/sign-up-details");
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  // Don't render anything until the check is complete
  if (!isLoaded || !isSignedIn || !user.publicMetadata.phoneNumber) {
    return (
      <div className="text-center py-20">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Welcome back, {user.firstName || user.username}!
        </p>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-indigo-300">
          Account Information
        </h2>
        <div className="space-y-3 text-gray-300">
          <p>
            <strong>Email:</strong> {user.primaryEmailAddress?.toString()}
          </p>
          {/* Display phone number from public metadata */}
          <p>
            <strong>Phone:</strong>{" "}
            {user.publicMetadata.phoneNumber || "Not provided"}
          </p>
          <p>
            <strong>User ID:</strong>{" "}
            <span className="font-mono text-sm bg-gray-700 py-1 px-2 rounded">
              {user.id}
            </span>
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg hover:border-indigo-500 transition-colors group">
          <BoxIcon />
          <h3 className="text-xl font-semibold my-3 text-indigo-300">
            Manage Your Products
          </h3>
          <p className="text-gray-400 mb-4">
            View, add, or edit the products you have listed for rent.
          </p>
          <button className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg group-hover:bg-indigo-500 transition-colors">
            View Products
          </button>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg hover:border-green-500 transition-colors group">
          <SearchIcon />
          <h3 className="text-xl font-semibold my-3 text-green-300">
            Manage Your Rentals
          </h3>
          <p className="text-gray-400 mb-4">
            Check the status of items you are currently renting from others.
          </p>
          <button className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg group-hover:bg-green-500 transition-colors">
            View Rentals
          </button>
        </div>
      </div>
    </div>
  );
}
