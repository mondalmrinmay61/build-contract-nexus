
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Settings, ShieldAlert, Database, Server, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminDisputesList from "@/components/admin/AdminDisputesList";
import AdminPlatformSettings from "@/components/admin/AdminPlatformSettings";
import AdminSystemStats from "@/components/admin/AdminSystemStats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("disputes");

  // Check if user is admin
  const isAdmin = profile?.user_type === "admin";

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow bg-gray-50 flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Access Denied</CardTitle>
              <CardDescription className="text-center">
                You don't have permission to access the admin dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
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
          <div className="flex items-center gap-3 mb-8">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="disputes" className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Disputes
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Platform Settings
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                System Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="disputes">
              <AdminDisputesList />
            </TabsContent>

            <TabsContent value="settings">
              <AdminPlatformSettings />
            </TabsContent>

            <TabsContent value="stats">
              <AdminSystemStats />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
