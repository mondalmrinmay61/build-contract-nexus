
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Clock, 
  Wallet, 
  Check 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type ProjectWithCategory = Database["public"]["Tables"]["projects"]["Row"] & {
  categories: Database["public"]["Tables"]["categories"]["Row"] | null;
};

type Bid = Database["public"]["Tables"]["bids"]["Row"];

const ContractorDashboard = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [projects, setProjects] = useState<ProjectWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchContractorData = async () => {
      try {
        setLoading(true);
        // Fetch bids made by this contractor
        const { data: bidsData, error: bidsError } = await supabase
          .from("bids")
          .select("*")
          .eq("contractor_id", user.id)
          .order("created_at", { ascending: false });

        if (bidsError) throw bidsError;
        
        // Fetch some available projects that match contractor's skills
        // In a real implementation, you would filter based on contractor's skills
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select(`
            *,
            categories:category_id(*)
          `)
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(6);

        if (projectsError) throw projectsError;

        if (bidsData) setBids(bidsData);
        if (projectsData) setProjects(projectsData);
      } catch (error: any) {
        toast({
          title: "Error loading data",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContractorData();
  }, [user]);

  const getBidStatusBadgeClass = (status: string | null) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Contractor Dashboard</h2>
        <Button asChild>
          <Link to="/projects/browse" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            Browse Projects
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Bids
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">
                {bids.filter(b => b.status === "pending").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accepted Bids
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">
                {bids.filter(b => b.status === "accepted").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">$0.00</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Your Recent Bids</h3>
          
          {loading ? (
            <div className="text-center py-10">
              <p>Loading your bids...</p>
            </div>
          ) : bids.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">You haven't submitted any bids yet</p>
              <Link to="/projects/browse" className="text-primary hover:underline mt-2 inline-block">
                Browse available projects
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bids.slice(0, 3).map((bid) => (
                <Card key={bid.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-base">Bid: ${bid.proposed_budget}</CardTitle>
                        <CardDescription>Project ID: {bid.project_id}</CardDescription>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getBidStatusBadgeClass(bid.status)}`}>
                        {bid.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {bid.proposal_text.substring(0, 100)}...
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" asChild className="w-full">
                      <Link to={`/bids/${bid.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {bids.length > 3 && (
                <div className="text-center mt-4">
                  <Button variant="outline" asChild>
                    <Link to="/bids">View All Bids</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Available Projects</h3>
          
          {loading ? (
            <div className="text-center py-10">
              <p>Loading available projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No available projects found</p>
              <p className="text-sm text-gray-400 mt-1">
                Check back later for new opportunities
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 3).map((project) => (
                <Card key={project.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    <CardDescription className="flex justify-between">
                      <span>{project.location}</span>
                      <span className="text-primary font-medium">
                        ${project.budget}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="mt-2">
                      <span className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs">
                        {project.categories?.name || "General"}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" asChild className="w-full">
                      <Link to={`/projects/${project.id}`}>View Project</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              <div className="text-center mt-4">
                <Button variant="outline" asChild>
                  <Link to="/projects/browse">Browse All Projects</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractorDashboard;
