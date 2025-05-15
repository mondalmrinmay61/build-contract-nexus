
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  contractId: z.string().uuid({
    message: "Please select a contract",
  }),
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters",
  }),
});

interface CreateDisputeFormProps {
  onSubmitSuccess?: () => void;
}

const CreateDisputeForm = ({ onSubmitSuccess }: CreateDisputeFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractId: "",
      reason: "",
    },
  });

  const { data: contracts, isLoading: isLoadingContracts } = useQuery({
    queryKey: ["user-contracts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          *,
          projects:project_id (title)
        `)
        .or(`contractor_id.eq.${user?.id},projects.client_id.eq.${user?.id}`)
        .eq("status", "ongoing");

      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("disputes").insert({
        contract_id: values.contractId,
        raised_by_id: user.id,
        reason: values.reason,
      });

      if (error) throw error;

      toast({
        title: "Dispute created",
        description: "Your dispute has been submitted successfully",
      });

      form.reset();
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create dispute",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-4">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Create New Dispute</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="contractId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract</FormLabel>
                <Select
                  disabled={isSubmitting || isLoadingContracts}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a contract" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contracts?.map((contract) => (
                      <SelectItem key={contract.id} value={contract.id}>
                        {contract.projects?.title || "Unnamed Project"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Dispute</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Explain the issue in detail..."
                    disabled={isSubmitting}
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Dispute"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateDisputeForm;
