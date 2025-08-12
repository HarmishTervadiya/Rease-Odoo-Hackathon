import React, { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  setUserCookies,
  clearUserCookies,
  setCookie,
  deleteCookie,
} from "../utils/cookies.js";
import axios from "axios";

export function AuthListener() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { userId, getToken } = useAuth(); // Added getToken for proper token retrieval

  useEffect(() => {
    const handleAuth = async () => {
      if (!isLoaded) return;

      if (isSignedIn && user) {
        try {
          // User is signed in, set cookies
          const role = (user?.unsafeMetadata?.role || "customer").toLowerCase();
          const clerkUserId = user?.id;

          if (clerkUserId && role) {
            // Set Clerk-based cookies
            setUserCookies(clerkUserId, role);
            console.log("AuthListener: Clerk cookies set for user", {
              clerkUserId,
              role,
            });

            const apiBaseUrl = "http://localhost:3000";

            // Get the actual JWT token from Clerk
            const token = userId;

            if (!isSignedIn || !token) {
              throw new Error("Not signed in or missing token");
            }

            // Fixed axios request structure
            const response = await axios.post(
              `${apiBaseUrl}/api/v1/users/register`,
              {}, // Empty body - move data here if needed
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

            setCookie("userIdDB", response.data.data._id, 7);

            // Also set individual cookies for easier access
            setCookie("clerkUserId", clerkUserId, 7);
            setCookie("role", role, 7);
          }
        } catch (error) {
          console.error("Error in AuthListener:", error);
          // Handle error appropriately - maybe clear cookies on auth failure
          clearUserCookies();
          deleteCookie("userIdDB");
          deleteCookie("clerkUserId");
        }
      } else {
        // User is signed out, clear cookies
        clearUserCookies();
        // Also clear MongoDB userId cookie
        deleteCookie("userIdDB");
        deleteCookie("clerkUserId");
        console.log("AuthListener: All cookies cleared - user signed out");
      }
    };

    handleAuth();
  }, [isLoaded, isSignedIn, user, getToken]);

  // This component doesn't render anything
  return null;
}
