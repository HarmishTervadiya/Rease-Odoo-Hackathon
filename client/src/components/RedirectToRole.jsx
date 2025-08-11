import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

export function RedirectToRole() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) return;

    const phoneNumber = user?.unsafeMetadata?.phoneNumber;
    const role = (user?.unsafeMetadata?.role || "customer").toLowerCase();

    if (!phoneNumber) {
      navigate("/sign-up-details", { replace: true });
      return;
    }

    if (role === "vendor") {
      navigate("/vendor", { replace: true });
    } else {
      navigate("/customer", { replace: true });
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  return null;
}
