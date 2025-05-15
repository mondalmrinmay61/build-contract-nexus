
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DisputeDetail from "@/components/disputes/DisputeDetail";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const DisputeDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: dispute, isLoading } = useQuery({
    queryKey: ["dispute", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disputes")
        .select(`
          *,
          contracts:contract_id (*),
          raised_by:raised_by_id (name, user_type)
        `)
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!id,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link to="/disputes" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Back to Disputes
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">Loading dispute details...</div>
          ) : dispute ? (
            <DisputeDetail dispute={dispute} />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold">Dispute not found</h2>
              <p className="mt-2 text-gray-600">
                The dispute you're looking for does not exist or you don't have permission to view it.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DisputeDetailPage;
