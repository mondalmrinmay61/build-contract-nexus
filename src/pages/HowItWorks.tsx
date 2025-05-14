
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const clientSteps = [
    {
      title: "Create an account",
      description: "Sign up as a Client and verify your identity and company details.",
    },
    {
      title: "Post your project",
      description: "Describe your project needs, set a budget, and propose milestones.",
    },
    {
      title: "Review bids",
      description: "Evaluate contractor proposals and choose the best fit for your needs.",
    },
    {
      title: "Fund the milestone",
      description: "Securely fund project milestones through our escrow system.",
    },
    {
      title: "Review and approve work",
      description: "Verify completed work and release payments for each milestone.",
    },
    {
      title: "Leave feedback",
      description: "Rate and review your contractor after project completion.",
    },
  ];

  const contractorSteps = [
    {
      title: "Create a professional profile",
      description: "Sign up, complete verification, and showcase your skills and experience.",
    },
    {
      title: "Find relevant projects",
      description: "Browse project listings or get matched with relevant opportunities.",
    },
    {
      title: "Submit quality proposals",
      description: "Send detailed bids and accept or modify proposed milestones.",
    },
    {
      title: "Win contracts",
      description: "Get hired based on your expertise, reviews, and competitive pricing.",
    },
    {
      title: "Complete milestones",
      description: "Finish work on time and request milestone completion reviews.",
    },
    {
      title: "Get paid securely",
      description: "Receive payments directly to your wallet after milestone approval.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900">How ContractHub Works</h1>
              <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
                Our platform simplifies the process of connecting factories with skilled contractors,
                managing projects, and handling payments securely.
              </p>
            </div>
            
            {/* For Clients Section */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-center mb-12">For Clients</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {clientSteps.map((step, index) => (
                  <div key={`client-${index}`} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-100 rounded-full p-2 mr-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* For Contractors Section */}
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-center mb-12">For Contractors</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {contractorSteps.map((step, index) => (
                  <div key={`contractor-${index}`} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-100 rounded-full p-2 mr-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
