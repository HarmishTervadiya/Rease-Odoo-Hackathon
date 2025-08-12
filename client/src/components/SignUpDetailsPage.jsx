import React, { useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { setUserCookies } from "../utils/cookies.js";
import axios from "axios";

export function SignUpDetailsPage() {
  const { user } = useUser();
  const { userId, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("customer"); // default to a valid backend enum
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
      setError("Please enter a valid phone number (e.g., +1234567890).");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      // Save BOTH phone number and role to Clerk metadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          phoneNumber: phoneNumber,
          role: role,
        },
      });

      // Also persist the user to our backend database
      const apiBaseUrl = "http://localhost:3000";
      const token = userId;
      if (!isSignedIn || !token) {
        throw new Error("Not signed in or missing token");
      }

      const payload = {
        name:
          user?.fullName ||
          [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
          "",
        email:
          user?.primaryEmailAddress?.emailAddress ||
          user?.emailAddresses?.[0]?.emailAddress ||
          "",
        mobileNo: phoneNumber,
        role,
        profilePicUri: user?.imageUrl || "",
      };

      const response = await axios.post(
        `${apiBaseUrl}/api/v1/users/register`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: false,
        }
      );

      // Set cookies for userId and role from MongoDB response
      console.log("User details saved successfully:", response.data);

      // Set cookies with MongoDB data
      setUserCookies(response.data.data._id, response.data.data.role);

      // Also set a specific cookie for the MongoDB userId if needed
      const { setCookie } = await import("../utils/cookies.js");
      setCookie("userIdDB", response.data.data._id, 7);

      console.log("Cookies set successfully");
      console.log("MongoDB userId:", response.data.data._id);
      console.log("User role:", response.data.data.role);

      navigate("/dashboard");
    } catch (err) {
      console.error("Error during signup persistence:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to save details. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-2">One Last Step</h1>
        <p className="text-gray-400 text-center mb-6">
          Please provide your phone number to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-300"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="+1 555-555-5555"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              What will you be using Rentify for?
            </label>
            <div className="mt-2 space-y-2">
              <div
                onClick={() => setRole("customer")}
                className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                  role === "customer"
                    ? "bg-indigo-600 border-indigo-500"
                    : "bg-gray-700 border-gray-600"
                }`}
              >
                <input
                  id="role-customer"
                  name="role"
                  type="radio"
                  checked={role === "customer"}
                  onChange={() => setRole("customer")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label
                  htmlFor="role-customer"
                  className="ml-3 block text-sm font-medium text-white"
                >
                  I want to rent items (Customer)
                </label>
              </div>
              <div
                onClick={() => setRole("vendor")}
                className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                  role === "vendor"
                    ? "bg-indigo-600 border-indigo-500"
                    : "bg-gray-700 border-gray-600"
                }`}
              >
                <input
                  id="role-vendor"
                  name="role"
                  type="radio"
                  checked={role === "vendor"}
                  onChange={() => setRole("vendor")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label
                  htmlFor="role-vendor"
                  className="ml-3 block text-sm font-medium text-white"
                >
                  I want to list items for rent (Vendor)
                </label>
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save and Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
