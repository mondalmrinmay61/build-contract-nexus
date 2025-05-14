
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Connect with the best</span>
              <span className="block text-green-600">industrial contractors</span>
            </h1>
            <p className="mt-5 text-xl text-gray-500 max-w-md">
              A marketplace connecting factories with skilled contractors for construction,
              electrical, plumbing, and more.
            </p>
            <div className="mt-8 flex space-x-4">
              <Button asChild size="lg">
                <Link to="/register">Post a Project</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/register?type=contractor">Find Projects</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src="/placeholder.svg"
              alt="Industrial contractors"
              className="h-full w-full object-cover rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
