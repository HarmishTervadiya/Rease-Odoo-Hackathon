import React from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { SearchIcon, BoxIcon, ShieldCheckIcon } from "./Icons";

export function HomePage() {
  return (
    <>
      <div className="text-center py-20 sm:py-28">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
          The Modern Way to{" "}
          <span className="text-indigo-400">Rent Anything</span>
        </h1>
        <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
          From party supplies to professional equipment, find what you need or
          earn by renting out your own items. Secure, simple, and
          community-driven.
        </p>
        <SignedIn>
          <Link
            to="/dashboard"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105 inline-block shadow-lg shadow-green-500/30"
          >
            Go to Your Dashboard
          </Link>
        </SignedIn>
        <SignedOut>
          <Link
            to="/sign-up"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105 inline-block shadow-lg shadow-indigo-500/30"
          >
            Get Started For Free
          </Link>
        </SignedOut>
      </div>

      <div className="py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
            <SearchIcon />
            <h3 className="text-xl font-bold mt-4 mb-2">Find a Rental</h3>
            <p className="text-gray-400">
              Easily search and find the items you need from a vast community
              inventory.
            </p>
          </div>
          <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
            <BoxIcon />
            <h3 className="text-xl font-bold mt-4 mb-2">List Your Items</h3>
            <p className="text-gray-400">
              Turn your unused items into a source of income by listing them for
              rent.
            </p>
          </div>
          <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
            <ShieldCheckIcon />
            <h3 className="text-xl font-bold mt-4 mb-2">Secure & Trusted</h3>
            <p className="text-gray-400">
              We verify users and handle payments to ensure a safe experience
              for everyone.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
