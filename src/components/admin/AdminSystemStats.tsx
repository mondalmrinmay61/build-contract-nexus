
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Database, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SystemStats {
  users: number;
  projects: number;
  contracts: number;
  disputes: number;
  total_earnings: number;
}

interface MonthlyData {
  name: string;
  projects: number;
  disputes: number;
}

const AdminSystemStats = () => {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin-system-stats"],
    queryFn: async () => {
      // Get counts from different tables
      const usersPromise = supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });
      
      const projectsPromise = supabase
        .from("projects")
        .select("id", { count: "exact", head: true });
      
      const contractsPromise = supabase
        .from("contracts")
        .select("id", { count: "exact", head: true });
      
      const disputesPromise = supabase
        .from("disputes")
        .select("id", { count: "exact", head: true });
      
      const earningsPromise = supabase
        .from("platform_earnings")
        .select("total_platform_earning");
      
      const [
        usersResult,
        projectsResult, 
        contractsResult, 
        disputesResult,
        earningsResult
      ] = await Promise.all([
        usersPromise,
        projectsPromise,
        contractsResult,
        disputesPromise,
        earningsPromise
      ]);
      
      // Calculate total earnings
      const totalEarnings = earningsResult.data?.reduce(
        (sum, item) => sum + (parseFloat(item.total_platform_earning) || 0), 
        0
      ) || 0;
      
      return {
        users: usersResult.count || 0,
        projects: projectsResult.count || 0,
        contracts: contractsResult.count || 0,
        disputes: disputesResult.count || 0,
        total_earnings: totalEarnings
      };
    }
  });
  
  // Mock monthly data for the chart
  // In a real app, this would come from the database with proper aggregation
  const monthlyData: MonthlyData[] = [
    { name: "Jan", projects: 4, disputes: 1 },
    { name: "Feb", projects: 6, disputes: 2 },
    { name: "Mar", projects: 8, disputes: 1 },
    { name: "Apr", projects: 10, disputes: 3 },
    { name: "May", projects: 12, disputes: 2 },
    { name: "Jun", projects: 16, disputes: 4 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Users"
          value={stats?.users || 0}
          description="Registered users"
          icon={<Users />}
          isLoading={isLoadingStats}
        />
        
        <StatCard 
          title="Total Projects"
          value={stats?.projects || 0}
          description="Created projects"
          icon={<Database />}
          isLoading={isLoadingStats}
        />
        
        <StatCard 
          title="Active Contracts"
          value={stats?.contracts || 0}
          description="Ongoing contracts"
          icon={<Database />}
          isLoading={isLoadingStats}
        />
        
        <StatCard 
          title="Platform Earnings"
          value={`$${(stats?.total_earnings || 0).toFixed(2)}`}
          description="Total platform fees collected"
          icon={<TrendingUp />}
          isLoading={isLoadingStats}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Activity</CardTitle>
          <CardDescription>Projects and disputes over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="projects" fill="#4f46e5" name="Projects" />
                <Bar dataKey="disputes" fill="#f43f5e" name="Disputes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const StatCard = ({ title, value, description, icon, isLoading }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {isLoading ? "Loading..." : value}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default AdminSystemStats;
