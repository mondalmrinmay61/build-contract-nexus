
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MessageSquare,
  User,
  LogIn,
  Menu,
  X,
  Wallet,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Navigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Determine if a link is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className="bg-white border-b border-gray-200 relative z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-bold text-xl text-primary">
                ContractHub
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive("/") && !user
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Home
              </Link>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      isActive("/dashboard")
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/projects/browse"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      isActive("/projects/browse")
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Browse Projects
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/about"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      isActive("/about")
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    About
                  </Link>
                  <Link
                    to="/how-it-works"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      isActive("/how-it-works")
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    How It Works
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Secondary navigation - auth buttons or user menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                <Link
                  to="/messages"
                  className={`p-2 rounded-full ${
                    isActive("/messages")
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  aria-label="Messages"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link
                  to="/disputes"
                  className={`p-2 rounded-full ${
                    isActive("/disputes")
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  aria-label="Disputes"
                >
                  <Shield className="h-5 w-5" />
                </Link>
                <Link
                  to="/wallet"
                  className={`p-2 rounded-full ${
                    isActive("/wallet")
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  aria-label="Wallet"
                >
                  <Wallet className="h-5 w-5" />
                </Link>
                <Link
                  to="/profile"
                  className={`p-2 rounded-full ${
                    isActive("/profile")
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  aria-label="Profile"
                >
                  <User className="h-5 w-5" />
                </Link>
                <Button variant="ghost" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" /> Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">
                {mobileMenuOpen ? "Close menu" : "Open menu"}
              </span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                isActive("/") && !user
                  ? "bg-primary-50 border-l-4 border-primary text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`block pl-3 pr-4 py-2 text-base font-medium ${
                    isActive("/dashboard")
                      ? "bg-primary-50 border-l-4 border-primary text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/projects/browse"
                  className={`block pl-3 pr-4 py-2 text-base font-medium ${
                    isActive("/projects/browse")
                      ? "bg-primary-50 border-l-4 border-primary text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Projects
                </Link>
                <Link
                  to="/messages"
                  className={`block pl-3 pr-4 py-2 text-base font-medium ${
                    isActive("/messages")
                      ? "bg-primary-50 border-l-4 border-primary text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Link>
                <Link
                  to="/disputes"
                  className={`block pl-3 pr-4 py-2 text-base font-medium ${
                    isActive("/disputes")
                      ? "bg-primary-50 border-l-4 border-primary text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Disputes
                </Link>
                <Link
                  to="/wallet"
                  className={`block pl-3 pr-4 py-2 text-base font-medium ${
                    isActive("/wallet")
                      ? "bg-primary-50 border-l-4 border-primary text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wallet
                </Link>
                <Link
                  to="/profile"
                  className={`block pl-3 pr-4 py-2 text-base font-medium ${
                    isActive("/profile")
                      ? "bg-primary-50 border-l-4 border-primary text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  className={`block pl-3 pr-4 py-2 text-base font-medium ${
                    isActive("/about")
                      ? "bg-primary-50 border-l-4 border-primary text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/how-it-works"
                  className={`block pl-3 pr-4 py-2 text-base font-medium ${
                    isActive("/how-it-works")
                      ? "bg-primary-50 border-l-4 border-primary text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  to="/login"
                  className={`block pl-3 pr-4 py-2 text-base font-medium ${
                    isActive("/login")
                      ? "bg-primary-50 border-l-4 border-primary text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={`block pl-3 pr-4 py-2 text-base font-medium ${
                    isActive("/register")
                      ? "bg-primary-50 border-l-4 border-primary text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
