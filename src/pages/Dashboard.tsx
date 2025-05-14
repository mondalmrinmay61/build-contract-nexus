
import { useAuth } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ClientDashboard from "@/components/client/ClientDashboard";
import ContractorDashboard from "@/components/contractor/ContractorDashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { profile, loading } = useAuth();

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <p>Loading dashboard...</p>
        </div>
      );
    }

    // If profile is not completed, show prompt to complete profile
    if (!profile?.name) {
      return (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Complete Your Profile</h2>
          <p className="mb-4">Please complete your profile information to get started.</p>
          <Button asChild>
            <Link to="/profile">Complete Profile</Link>
          </Button>
        </Card>
      );
    }

    // Show appropriate dashboard based on user type
    switch (profile?.user_type) {
      case "client":
        return <ClientDashboard />;
      case "contractor":
        return <ContractorDashboard />;
      default:
        return (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to ContractHub</h2>
            <p>There seems to be an issue with your account type. Please contact support.</p>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderDashboardContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
