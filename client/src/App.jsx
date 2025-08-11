import React from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { SignInPage, SignUpPage, AppRoutes } from "./components";

// --- [IMPORTANT] ---
// Replace this with your actual Publishable Key from your Clerk Dashboard.
// You can get your key from https://dashboard.clerk.com/
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Publishable Key. Please set CLERK_PUBLISHABLE_KEY in your environment"
  );
}

function ClerkProviderWithNavigate({ children, publishableKey }) {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      navigate={(to) => navigate(to)}
      appearance={{ baseTheme: "dark", variables: { colorPrimary: "#6366f1" } }}
    >
      {children}
    </ClerkProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ClerkProviderWithNavigate publishableKey={CLERK_PUBLISHABLE_KEY}>
        <Routes>
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </ClerkProviderWithNavigate>
    </BrowserRouter>
  );
}

export default App;
