
const steps = [
  {
    number: "01",
    title: "Create an account",
    description:
      "Sign up as a client or contractor and complete your profile with relevant information.",
  },
  {
    number: "02",
    title: "Post or find projects",
    description:
      "Clients post detailed project requirements while contractors browse and bid on relevant projects.",
  },
  {
    number: "03",
    title: "Agree on milestones",
    description:
      "Review proposals, negotiate terms, and finalize project milestones before starting work.",
  },
  {
    number: "04",
    title: "Complete work & get paid",
    description:
      "Contractors complete milestones, clients approve work, and secure payments are released.",
  },
];

const HowItWorks = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            A simple, four-step process to connect and complete projects
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
                <div className="text-green-500 text-5xl font-bold mb-4">{step.number}</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 flex-grow">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
