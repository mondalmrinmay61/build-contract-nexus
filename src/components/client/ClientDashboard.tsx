
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Briefcase, 
  Clock,
  Plus
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

const ClientDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setProjects(data);
      } catch (error: any) {
        toast({
          title: "Error loading projects",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const getStatusBadgeClass = (status: string | null) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Client Dashboard</h2>
        <Button asChild>
          <Link to="/projects/new" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Post New Project
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">
                {projects.filter(p => p.status === "active").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">
                {projects.filter(p => p.status === "open").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-lg font-medium mb-4">Your Projects</h3>
      
      {loading ? (
        <div className="text-center py-10">
          <p>Loading your projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">You haven't posted any projects yet</p>
          <Link to="/projects/new" className="text-primary hover:underline mt-2 inline-block">
            Post your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusBadgeClass(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <CardDescription>{project.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {project.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-medium">Budget: ${project.budget}</span>
                  <span className="text-gray-500">
                    {project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link to={`/projects/${project.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
