import React, { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  setUserCookies,
  clearUserCookies,
  setCookie,
  deleteCookie,
} from "../utils/cookies.js";

export function AuthListener() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
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

        // Also set individual cookies for easier access
        setCookie("clerkUserId", clerkUserId, 7);
        setCookie("role", role, 7);
      }
    } else {
      // User is signed out, clear cookies
      clearUserCookies();
      // Also clear MongoDB userId cookie
      deleteCookie("userIdDB");
      deleteCookie("clerkUserId");
      console.log("AuthListener: All cookies cleared - user signed out");
    }
  }, [isLoaded, isSignedIn, user]);

  // This component doesn't render anything
  return null;
}
