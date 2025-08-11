import React, { useEffect, useState } from "react";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  UserButton,
  useUser,
  RedirectToSignIn,
  useClerk,
} from "@clerk/clerk-react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Outlet,
  useLocation,
} from "react-router-dom";

// --- [IMPORTANT] ---
// Replace this with your actual Publishable Key from your Clerk Dashboard.
// You can get your key from https://dashboard.clerk.com/
const CLERK_PUBLISHABLE_KEY =
  "pk_test_Z3JhdGVmdWwtY2F0ZmlzaC05NS5jbGVyay5hY2NvdW50cy5kZXYk";

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Publishable Key. Please set CLERK_PUBLISHABLE_KEY in your environment"
  );
}

// --- Data Object ---
const rentifyData = {
  homeFeatures: [
    {
      title: "Find a Rental",
      description:
        "Easily search and find the items you need from a vast community inventory.",
      icon: <SearchIcon />,
    },
    {
      title: "List Your Items",
      description:
        "Turn your unused items into a source of income by listing them for rent.",
      icon: <BoxIcon />,
    },
    {
      title: "Secure & Trusted",
      description:
        "We verify users and handle payments to ensure a safe experience for everyone.",
      icon: <ShieldCheckIcon />,
    },
  ],
  dashboardCards: [
    {
      title: "Manage Your Products",
      description: "View, add, or edit the products you have listed for rent.",
      icon: <BoxIcon />,
      buttonText: "View Products",
      theme: "indigo",
    },
    {
      title: "Manage Your Rentals",
      description:
        "Check the status of items you are currently renting from others.",
      icon: <SearchIcon />,
      buttonText: "View Rentals",
      theme: "green",
    },
  ],
};

// --- Helper Components & Icons ---

const BoxIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8 text-indigo-400"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8 text-indigo-400"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ShieldCheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8 text-indigo-400"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
);

// --- Layout Component ---
function AppLayout() {
  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

// --- Page Components ---

function Header() {
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
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </nav>
      </div>
    </header>
  );
}

function HomePage() {
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
          {rentifyData.homeFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800/50 p-8 rounded-xl border border-gray-700"
            >
              {feature.icon}
              <h3 className="text-xl font-bold mt-4 mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SignInPage() {
  return (
    <div className="flex items-center justify-center py-12">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        redirectUrl="/"
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex items-center justify-center py-12">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        redirectUrl="/"
      />
    </div>
  );
}

function SignUpDetailsPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("renter");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
      setError("Please enter a valid phone number (e.g., +1234567890).");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      await user.update({
        unsafeMetadata: { ...user.unsafeMetadata, phoneNumber, role },
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Error updating user metadata:", err);
      setError("Failed to save details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-2">One Last Step</h1>
        <p className="text-gray-400 text-center mb-6">
          Complete your profile to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-300"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="+1 555-555-5555"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              What will you be using Rentify for?
            </label>
            <div className="mt-2 space-y-2">
              <div
                onClick={() => setRole("renter")}
                className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                  role === "renter"
                    ? "bg-indigo-600 border-indigo-500"
                    : "bg-gray-700 border-gray-600"
                }`}
              >
                <input
                  id="role-renter"
                  name="role"
                  type="radio"
                  checked={role === "renter"}
                  onChange={() => setRole("renter")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label
                  htmlFor="role-renter"
                  className="ml-3 block text-sm font-medium text-white"
                >
                  I want to rent items (Renter)
                </label>
              </div>
              <div
                onClick={() => setRole("owner")}
                className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                  role === "owner"
                    ? "bg-indigo-600 border-indigo-500"
                    : "bg-gray-700 border-gray-600"
                }`}
              >
                <input
                  id="role-owner"
                  name="role"
                  type="radio"
                  checked={role === "owner"}
                  onChange={() => setRole("owner")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label
                  htmlFor="role-owner"
                  className="ml-3 block text-sm font-medium text-white"
                >
                  I want to list items for rent (Owner)
                </label>
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save and Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- SIMPLIFIED COMPONENT ---
// The dashboard no longer needs complex logic, it just displays data.
function DashboardPage() {
  const { user } = useUser();

  if (!user) return null; // Should not happen due to the gatekeeper, but good practice.

  const userRole = user.unsafeMetadata.role || "Not set";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Welcome back, {user.firstName || user.username}!
        </p>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-indigo-300">
          Account Information
        </h2>
        <div className="space-y-3 text-gray-300">
          <p>
            <strong>Email:</strong> {user.primaryEmailAddress?.toString()}
          </p>
          <p>
            <strong>Phone:</strong>{" "}
            {user.unsafeMetadata.phoneNumber || "Not provided"}
          </p>
          <p>
            <strong>Role:</strong>{" "}
            <span className="capitalize bg-gray-700 py-1 px-2 rounded">
              {userRole}
            </span>
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {rentifyData.dashboardCards.map((card, index) => (
          <div
            key={index}
            className={`bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg hover:border-${card.theme}-500 transition-colors group`}
          >
            {card.icon}
            <h3 className={`text-xl font-semibold my-3 text-${card.theme}-300`}>
              {card.title}
            </h3>
            <p className="text-gray-400 mb-4">{card.description}</p>
            <button
              className={`bg-${card.theme}-600 text-white font-bold py-2 px-4 rounded-lg group-hover:bg-${card.theme}-500 transition-colors`}
            >
              {card.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
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
          <Route
            path="*"
            element={
              <>
                <SignedIn>
                  <AppRoutes />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </ClerkProviderWithNavigate>
    </BrowserRouter>
  );
}

// --- NEW GATEKEEPER COMPONENT ---
// This component handles all protected routes and the redirection logic.
function AppRoutes() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoaded) return; // Wait until Clerk is ready

    const needsDetails =
      !user.unsafeMetadata?.phoneNumber || !user.unsafeMetadata?.role;
    const onDetailsPage = location.pathname.startsWith("/sign-up-details");

    if (needsDetails && !onDetailsPage) {
      navigate("/sign-up-details", { replace: true });
    }
  }, [isLoaded, user, location, navigate]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sign-up-details" element={<SignUpDetailsPage />} />
      </Route>
      {/* Redirect non-matched authenticated routes to the dashboard */}
      <Route path="*" element={<RedirectToDashboard />} />
    </Routes>
  );
}

function RedirectToDashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);
  return null;
}

export default App;
