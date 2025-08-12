import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { BoxIcon } from "./Icons";
import { clearUserCookies, deleteCookie } from "../utils/cookies.js";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

export function Header() {
  const { userId } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  const handleSignOut = () => {
    // Clear all user cookies when user signs out
    clearUserCookies();
    deleteCookie("userIdDB");
    deleteCookie("clerkUserId");
    console.log("Header: All cookies cleared on sign out");
  };

  // Fetch cart item count when user is signed in
  useEffect(() => {
    if (userId) {
      fetchCartItemCount();
    } else {
      setCartItemCount(0);
    }
  }, [userId]);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      if (userId) {
        fetchCartItemCount();
      }
    };

    // Listen for custom cart update events
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [userId]);

  const fetchCartItemCount = async () => {
    try {
      setCartLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await axios.get(`${baseUrl}/api/v1/cart/`, {
        headers: {
          Authorization: `Bearer ${userId}`,
        },
      });

      if (
        response.data &&
        response.data.data &&
        response.data.data.orderLines
      ) {
        const totalItems = response.data.data.orderLines.reduce(
          (total, line) => total + (line.quantity || 0),
          0
        );
        setCartItemCount(totalItems);
      } else {
        setCartItemCount(0);
      }
    } catch (err) {
      console.error("Error fetching cart count:", err);
      setCartItemCount(0);
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <BoxIcon />
          <span>Rease</span>
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
            <Link
              to="/cart"
              className="relative text-gray-300 hover:text-white transition-all duration-200 p-2 hover:scale-110"
              title="Shopping Cart"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
              {cartLoading && cartItemCount === 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  ...
                </span>
              )}
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
