import React from "react";
import { SignIn } from "@clerk/clerk-react";

export function SignInPage() {
  return (
    <div className="flex items-center justify-center py-12">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        redirectUrl="/dashboard"
      />
    </div>
  );
}
