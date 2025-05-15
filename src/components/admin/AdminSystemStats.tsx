
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
        contractsPromise,
        disputesPromise,
        earningsPromise
      ]);
      
      // Calculate total earnings
      const totalEarnings = earningsResult.data?.reduce(
        (sum, item) => sum + (parseFloat(String(item.total_platform_earning)) || 0), 
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

  // Fetch monthly data from the database
  const { data: monthlyData = [], isLoading: isLoadingMonthlyData } = useQuery({
    queryKey: ["admin-monthly-stats"],
    queryFn: async () => {
      // Define function to get projects by month
      async function getProjectsCountByMonth(monthOffset: number): Promise<number> {
        const date = new Date();
        date.setMonth(date.getMonth() - monthOffset);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const { count } = await supabase
          .from("projects")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startOfMonth.toISOString())
          .lte("created_at", endOfMonth.toISOString());
        
        return count || 0;
      }

      // Define function to get disputes by month
      async function getDisputesCountByMonth(monthOffset: number): Promise<number> {
        const date = new Date();
        date.setMonth(date.getMonth() - monthOffset);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const { count } = await supabase
          .from("disputes")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startOfMonth.toISOString())
          .lte("created_at", endOfMonth.toISOString());
        
        return count || 0;
      }
      
      try {
        // Get project counts by month
        const { data: projectMonthlyData, error: projectError } = await supabase
          .rpc('get_projects_by_month', { 
            months_back: 6
          });

        // Get dispute counts by month
        const { data: disputeMonthlyData, error: disputeError } = await supabase
          .rpc('get_disputes_by_month', { 
            months_back: 6
          });

        if (projectError || disputeError) {
          // Fallback data if RPC functions are not available yet
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
          const result: MonthlyData[] = [];
          
          // Fetch data for each month
          for (let i = 0; i < months.length; i++) {
            result.push({
              name: months[i],
              projects: await getProjectsCountByMonth(5 - i),
              disputes: await getDisputesCountByMonth(5 - i)
            });
          }
          
          return result;
        }

        // Combine the data
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthMap = new Map<string, MonthlyData>();
        
        // Type assertion for projectMonthlyData and disputeMonthlyData
        const typedProjectData = projectMonthlyData as Array<{ month: string; count: number }> || [];
        const typedDisputeData = disputeMonthlyData as Array<{ month: string; count: number }> || [];
        
        // Create a map of month data from projects
        typedProjectData.forEach((item) => {
          const monthIndex = new Date(item.month).getMonth();
          const monthName = monthNames[monthIndex];
          monthMap.set(monthName, {
            name: monthName,
            projects: item.count,
            disputes: 0
          });
        });

        // Add dispute counts
        typedDisputeData.forEach((item) => {
          const monthIndex = new Date(item.month).getMonth();
          const monthName = monthNames[monthIndex];
          
          if (monthMap.has(monthName)) {
            const existing = monthMap.get(monthName)!;
            monthMap.set(monthName, {
              ...existing,
              disputes: item.count
            });
          } else {
            monthMap.set(monthName, {
              name: monthName,
              projects: 0,
              disputes: item.count
            });
          }
        });

        // Convert map to array and sort by month
        return Array.from(monthMap.values()).sort((a, b) => {
          const monthA = monthNames.indexOf(a.name);
          const monthB = monthNames.indexOf(b.name);
          return monthA - monthB;
        });
      } catch (error) {
        console.error("Error fetching monthly data:", error);
        return [];
      }
    }
  });

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
          value={`₹${(stats?.total_earnings || 0).toFixed(2)}`}
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
            {isLoadingMonthlyData ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading chart data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="projects" fill="#4f46e5" name="Projects" />
                  <Bar dataKey="disputes" fill="#f43f5e" name="Disputes" />
                </BarChart>
              </ResponsiveContainer>
            )}
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
