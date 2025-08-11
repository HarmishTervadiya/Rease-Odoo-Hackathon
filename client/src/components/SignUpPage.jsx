import React from "react";
import { SignUp } from "@clerk/clerk-react";

export function SignUpPage() {
  return (
    <div className="flex items-center justify-center py-12">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        redirectUrl="/dashboard"
      />
    </div>
  );
}
