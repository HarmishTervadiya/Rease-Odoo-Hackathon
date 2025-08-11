import React from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { BoxIcon } from "./Icons";
import { clearUserCookies, deleteCookie } from "../utils/cookies.js";

export function Header() {
  const handleSignOut = () => {
    // Clear all user cookies when user signs out
    clearUserCookies();
    deleteCookie("userIdDB");
    deleteCookie("clerkUserId");
    console.log("Header: All cookies cleared on sign out");
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <BoxIcon />
          <span>Rentify</span>
        </Link>
        <nav className="flex items-center space-x-4 sm:space-x-6">
          <Link
            to="/"
            className="text-gray-300 hover:text-white transition-colors hidden sm:block"
          >
            Home
          </Link>
          <SignedIn>
            <Link
              to="/dashboard"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
          </SignedIn>
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link
                to="/sign-in"
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg shadow-indigo-500/20"
              >
                Sign In
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" signOutCallback={handleSignOut} />
            </SignedIn>
          </div>
        </nav>
      </div>
    </header>
  );
}
