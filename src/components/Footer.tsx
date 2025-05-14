
import { Link } from "react-router-dom";
import { colors } from "@/lib/colors";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>
              ContractHub
            </h2>
            <p className="text-gray-300">
              The leading marketplace for industrial contracting services.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">For Clients</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white">
                  Post a Project
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-white">
                  How it Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-white">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">For Contractors</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register?type=contractor" className="text-gray-300 hover:text-white">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/find-projects" className="text-gray-300 hover:text-white">
                  Find Projects
                </Link>
              </li>
              <li>
                <Link to="/success-tips" className="text-gray-300 hover:text-white">
                  Success Tips
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>© {new Date().getFullYear()} ContractHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
