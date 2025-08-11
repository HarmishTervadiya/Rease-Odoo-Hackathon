import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export function SignUpDetailsPage() {
 const { user } = useUser();
 const navigate = useNavigate();
 const [phoneNumber, setPhoneNumber] = useState("");
 const [role, setRole] = useState("renter"); // New state for the role, default to 'renter'
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
      // Save BOTH phone number and role to unsafeMetadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          phoneNumber: phoneNumber,
          role: role, // Add the role here
        },
      });
      await user.reload();
      navigate("/dashboard");
    } catch (err) {
      console.error("Error updating user metadata:", err);
      setError("Failed to save details. Please try again.");
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
                onClick={() => setRole("renter")}
                className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                  role === "renter"
                    ? "bg-indigo-600 border-indigo-500"
                    : "bg-gray-700 border-gray-600"
                }`}
              >
                <input
                  id="role-renter"
                  name="role"
                  type="radio"
                  checked={role === "renter"}
                  onChange={() => setRole("renter")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label
                  htmlFor="role-renter"
                  className="ml-3 block text-sm font-medium text-white"
                >
                  I want to rent items (Renter)
                </label>
              </div>
              <div
                onClick={() => setRole("owner")}
                className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                  role === "owner"
                    ? "bg-indigo-600 border-indigo-500"
                    : "bg-gray-700 border-gray-600"
                }`}
              >
                <input
                  id="role-owner"
                  name="role"
                  type="radio"
                  checked={role === "owner"}
                  onChange={() => setRole("owner")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label
                  htmlFor="role-owner"
                  className="ml-3 block text-sm font-medium text-white"
                >
                  I want to list items for rent (Owner)
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
