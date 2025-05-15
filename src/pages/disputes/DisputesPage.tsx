
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DisputesList from "@/components/disputes/DisputesList";
import CreateDisputeForm from "@/components/disputes/CreateDisputeForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

const DisputesPage = () => {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: disputes, isLoading } = useQuery({
    queryKey: ["disputes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disputes")
        .select(`
          *,
          contracts:contract_id (*),
          raised_by:raised_by_id (name, user_type)
        `)
        .eq("raised_by_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl font-bold">Dispute Resolution</h1>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  New Dispute
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <CreateDisputeForm onSubmitSuccess={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Your Disputes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">Loading disputes...</div>
                ) : disputes && disputes.length > 0 ? (
                  <DisputesList disputes={disputes} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No disputes found</p>
                    <p className="text-sm text-gray-400 mt-2">
                      When you raise a dispute, it will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DisputesPage;
