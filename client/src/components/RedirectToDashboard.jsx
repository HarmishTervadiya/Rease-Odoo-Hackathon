import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function RedirectToDashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);
  return null;
}
