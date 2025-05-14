
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import BidForm from "@/components/projects/BidForm";

type Project = Database["public"]["Tables"]["projects"]["Row"] & {
  categories: Database["public"]["Tables"]["categories"]["Row"] | null;
  client: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

type Milestone = Database["public"]["Tables"]["milestones"]["Row"];

type Bid = Database["public"]["Tables"]["bids"]["Row"] & {
  contractor: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [userHasBid, setUserHasBid] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select(`
            *,
            categories:category_id(*),
            client:client_id(*)
          `)
          .eq("id", id)
          .single();

        if (projectError) throw projectError;
        if (projectData) setProject(projectData);

        // Fetch milestones
        const { data: milestonesData, error: milestonesError } = await supabase
          .from("milestones")
          .select("*")
          .eq("project_id", id)
          .order("order_index", { ascending: true });

        if (milestonesError) throw milestonesError;
        if (milestonesData) setMilestones(milestonesData);

        // Fetch bids
        const { data: bidsData, error: bidsError } = await supabase
          .from("bids")
          .select(`
            *,
            contractor:contractor_id(*)
          `)
          .eq("project_id", id)
          .order("created_at", { ascending: false });

        if (bidsError) throw bidsError;
        if (bidsData) {
          setBids(bidsData);
          // Check if current user has already bid on this project
          if (user) {
            const userBid = bidsData.find(bid => bid.contractor_id === user.id);
            setUserHasBid(!!userBid);
          }
        }
      } catch (error: any) {
        toast({
          title: "Error loading project",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, user]);

  const handleBidSubmit = (bid: any) => {
    // Add the new bid to the bids array
    if (profile) {
      const newBid: Bid = {
        ...bid,
        contractor: profile,
      };
      setBids([newBid, ...bids]);
      setUserHasBid(true);
      setShowBidForm(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: string | null) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-10">
              <p>Loading project details...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
              <p className="text-gray-600 mb-6">
                The project you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link to="/dashboard" className="text-primary hover:underline">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {project.location}
                </p>
              </div>
              <Badge className={`${getStatusBadgeClass(project.status)} capitalize`}>
                {project.status}
              </Badge>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Deadline</p>
                    <p className="font-medium">{formatDate(project.deadline)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{project.categories?.name || "General"}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Posted On</p>
                    <p className="font-medium">{formatDate(project.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {project.description}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Budget</h3>
                  <span className="text-2xl font-bold text-primary">${project.budget}</span>
                </div>
                <p className="text-sm text-gray-500">
                  This is the client's estimated budget for this project.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  {milestones.length > 0 ? (
                    <div className="space-y-4">
                      {milestones.map((milestone, index) => (
                        <div
                          key={milestone.id}
                          className="p-4 border rounded-lg flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">
                              Milestone {index + 1}: {milestone.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              Due date: {formatDate(milestone.due_date)}
                            </p>
                          </div>
                          <div className="font-bold">${milestone.amount}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No milestones defined for this project.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Project Bids</CardTitle>
                </CardHeader>
                <CardContent>
                  {bids.length > 0 ? (
                    <div className="space-y-6">
                      {bids.map((bid) => (
                        <div key={bid.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between mb-2">
                            <div className="font-medium">
                              {bid.contractor?.name || "Anonymous Contractor"}
                            </div>
                            <div className="font-bold text-primary">${bid.proposed_budget}</div>
                          </div>
                          <div className="text-sm mb-4">{bid.proposal_text}</div>
                          <div className="text-sm text-gray-500">
                            Proposed Timeline: {bid.proposed_timeline || "Not specified"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No bids yet. Be the first to bid on this project!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      {project.client?.avatar_url ? (
                        <img
                          src={project.client.avatar_url}
                          alt={project.client.name || ""}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-gray-600">
                          {project.client?.name?.charAt(0).toUpperCase() || "C"}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-lg">
                      {project.client?.name || "Anonymous Client"}
                    </h3>
                    {project.client?.company_name && (
                      <p className="text-sm text-gray-600 mt-1">
                        {project.client.company_name}
                      </p>
                    )}
                    <div className="mt-4">
                      <Badge variant="outline" className="mr-2">
                        {bids.length} {bids.length === 1 ? "Bid" : "Bids"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Show bid button only for contractors who haven't bid yet */}
              {profile?.user_type === "contractor" && project.status === "open" && (
                <div className="mt-6">
                  {!userHasBid ? (
                    showBidForm ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Submit Your Bid</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <BidForm
                            projectId={project.id}
                            milestones={milestones}
                            onBidSubmitted={handleBidSubmit}
                            onCancel={() => setShowBidForm(false)}
                          />
                        </CardContent>
                      </Card>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => setShowBidForm(true)}
                      >
                        Place Bid
                      </Button>
                    )
                  ) : (
                    <Card>
                      <CardContent className="text-center py-6">
                        <p className="text-green-600 font-medium">
                          You have already bid on this project
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Show action button for project owner */}
              {user?.id === project.client_id && (
                <div className="mt-6">
                  <Button className="w-full" asChild>
                    <Link to={`/projects/${project.id}/edit`}>Edit Project</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
