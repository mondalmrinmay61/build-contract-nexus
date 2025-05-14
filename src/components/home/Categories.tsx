
const categories = [
  {
    name: "Construction",
    description: "Masonry, Carpentry, Civil Engineering",
    icon: "🏗️",
  },
  {
    name: "Electrical",
    description: "Wiring, Circuit Design, Maintenance",
    icon: "⚡",
  },
  {
    name: "Plumbing",
    description: "Pipe Installation, Leak Repair, Drainage",
    icon: "🔧",
  },
  {
    name: "Painting",
    description: "Wall Painting, Industrial Coatings",
    icon: "🎨",
  },
  {
    name: "Labour Supply",
    description: "Skilled Labor, Unskilled Labor, Staffing",
    icon: "👷",
  },
  {
    name: "Transportation",
    description: "Trucking, Heavy Equipment Hauling",
    icon: "🚚",
  },
];

const Categories = () => {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Browse by Category
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Find contractors specialized in these industrial services
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <div
              key={index}
              className="relative bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-medium text-gray-900">{category.name}</h3>
              <p className="mt-2 text-gray-500">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
