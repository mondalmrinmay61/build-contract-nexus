
import { CheckCircle } from "lucide-react";

const features = [
  {
    title: "Find the right contractors",
    description: "Post your project and receive bids from qualified contractors in your area.",
  },
  {
    title: "Milestone-based payments",
    description: "Secure escrow payments released only when work is completed to satisfaction.",
  },
  {
    title: "Verified professionals",
    description: "All contractors undergo our thorough verification process.",
  },
  {
    title: "Project management tools",
    description: "Track progress, communicate, and manage documents all in one place.",
  },
];

const Features = () => {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Why Choose Our Platform
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Everything you need to manage industrial contracts in one place
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="relative">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
              </div>
              <p className="mt-2 text-base text-gray-500 pl-10">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
