
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Server, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PlatformSettings {
  id: string;
  client_fee_percentage: number;
  contractor_fee_percentage: number;
}

const AdminPlatformSettings = () => {
  const queryClient = useQueryClient();
  const [clientFeePercentage, setClientFeePercentage] = useState("");
  const [contractorFeePercentage, setContractorFeePercentage] = useState("");
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: async () => {
      // First try to get existing settings
      const { data, error } = await supabase
        .from("platform_fee_settings")
        .select("*")
        .limit(1);
        
      if (error) throw error;
      
      // If no settings exist, create default ones
      if (data.length === 0) {
        const defaultSettings = {
          client_fee_percentage: 5,
          contractor_fee_percentage: 10
        };
        
        const { data: newData, error: insertError } = await supabase
          .from("platform_fee_settings")
          .insert(defaultSettings)
          .select()
          .single();
          
        if (insertError) throw insertError;
        return newData;
      }
      
      return data[0];
    },
    onSuccess: (data) => {
      if (data) {
        setClientFeePercentage(data.client_fee_percentage.toString());
        setContractorFeePercentage(data.contractor_fee_percentage.toString());
      }
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: { 
      client_fee_percentage: number; 
      contractor_fee_percentage: number;
    }) => {
      if (!settings?.id) throw new Error("Settings ID not found");
      
      const { error } = await supabase
        .from("platform_fee_settings")
        .update(updatedSettings)
        .eq("id", settings.id);

      if (error) throw error;
      return { ...settings, ...updatedSettings };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      toast({
        title: "Settings updated",
        description: "Platform fee settings have been successfully updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const clientFee = parseFloat(clientFeePercentage);
    const contractorFee = parseFloat(contractorFeePercentage);
    
    if (isNaN(clientFee) || isNaN(contractorFee)) {
      toast({
        title: "Invalid input",
        description: "Please enter valid numbers for fee percentages",
        variant: "destructive",
      });
      return;
    }
    
    if (clientFee < 0 || clientFee > 100 || contractorFee < 0 || contractorFee > 100) {
      toast({
        title: "Invalid percentages",
        description: "Percentages must be between 0 and 100",
        variant: "destructive",
      });
      return;
    }
    
    updateSettingsMutation.mutate({
      client_fee_percentage: clientFee,
      contractor_fee_percentage: contractorFee
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-12">Loading platform settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Platform Fee Settings
        </CardTitle>
        <CardDescription>
          Configure the platform's fee percentages for clients and contractors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientFee">Client Fee Percentage</Label>
              <div className="relative">
                <Input
                  id="clientFee"
                  type="number"
                  value={clientFeePercentage}
                  onChange={(e) => setClientFeePercentage(e.target.value)}
                  step="0.1"
                  min="0"
                  max="100"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
              </div>
              <p className="text-sm text-gray-500">
                Fee charged to clients when paying for projects
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contractorFee">Contractor Fee Percentage</Label>
              <div className="relative">
                <Input
                  id="contractorFee"
                  type="number"
                  value={contractorFeePercentage}
                  onChange={(e) => setContractorFeePercentage(e.target.value)}
                  step="0.1"
                  min="0"
                  max="100"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
              </div>
              <p className="text-sm text-gray-500">
                Fee charged to contractors when receiving payments
              </p>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="mt-4 w-full md:w-auto"
            disabled={updateSettingsMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminPlatformSettings;
