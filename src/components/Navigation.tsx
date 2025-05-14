
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { colors } from "@/lib/colors";

const Navigation = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold" style={{ color: colors.primary }}>
                ContractHub
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/about" className="text-gray-700 hover:text-gray-900">
              About
            </Link>
            <Link to="/how-it-works" className="text-gray-700 hover:text-gray-900">
              How It Works
            </Link>
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
