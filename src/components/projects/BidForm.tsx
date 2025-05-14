
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

// Define the bid schema with Zod
const bidSchema = z.object({
  proposal_text: z.string().min(20, { message: "Proposal must be at least 20 characters" }),
  proposed_budget: z.coerce.number().positive({ message: "Budget must be a positive number" }),
  proposed_timeline: z.date().optional(),
  modify_milestones: z.boolean().default(false),
});

type BidFormValues = z.infer<typeof bidSchema>;

type Milestone = Database["public"]["Tables"]["milestones"]["Row"];

interface BidFormProps {
  projectId: string;
  milestones: Milestone[];
  onBidSubmitted?: (bid: any) => void;
  onCancel?: () => void;
}

const BidForm = ({ projectId, milestones, onBidSubmitted, onCancel }: BidFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modifiedMilestones, setModifiedMilestones] = useState(milestones);
  const [showMilestoneEditor, setShowMilestoneEditor] = useState(false);

  // Initialize the form
  const form = useForm<BidFormValues>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      proposal_text: "",
      proposed_budget: 0,
      modify_milestones: false,
    },
  });

  // Update a milestone in the modified milestones array
  const updateMilestone = (index: number, field: string, value: any) => {
    const updatedMilestones = [...modifiedMilestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value,
    };
    setModifiedMilestones(updatedMilestones);
  };

  // Handle form submission
  const onSubmit = async (data: BidFormValues) => {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to submit a bid",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bidData = {
        project_id: projectId,
        contractor_id: user.id,
        proposal_text: data.proposal_text,
        proposed_budget: data.proposed_budget,
        proposed_timeline: data.proposed_timeline ? data.proposed_timeline.toISOString() : null,
        modified_milestones: data.modify_milestones ? modifiedMilestones : null,
        status: "pending",
      };

      const { data: newBid, error } = await supabase
        .from("bids")
        .insert(bidData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Bid submitted",
        description: "Your bid has been submitted successfully",
      });

      if (onBidSubmitted) {
        onBidSubmitted(newBid);
      }
    } catch (error: any) {
      toast({
        title: "Error submitting bid",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="proposal_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Proposal</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your approach to the project, experience, and qualifications"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Be specific about how you'll deliver the project requirements.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="proposed_budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Bid Amount ($ USD)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter your bid amount"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="proposed_timeline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Proposed Completion Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full pl-3 text-left font-normal ${
                        !field.value ? "text-muted-foreground" : ""
                      }`}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Select completion date</span>
                      )}
                      <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {milestones.length > 0 && (
          <FormField
            control={form.control}
            name="modify_milestones"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      setShowMilestoneEditor(!!checked);
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I want to propose modifications to the project milestones
                  </FormLabel>
                  <FormDescription>
                    You can suggest changes to milestone descriptions, amounts, or deadlines.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        {showMilestoneEditor && (
          <div className="space-y-4 border rounded-md p-4">
            <h3 className="font-medium">Propose Modified Milestones</h3>
            {modifiedMilestones.map((milestone, index) => (
              <div key={index} className="space-y-3 pt-3 border-t first:border-t-0 first:pt-0">
                <div>
                  <label className="text-sm font-medium">
                    Milestone {index + 1} Description
                  </label>
                  <Textarea
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, "description", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Amount (USD)</label>
                    <Input
                      type="number"
                      value={milestone.amount}
                      onChange={(e) => updateMilestone(index, "amount", parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full mt-1 pl-3 text-left font-normal"
                        >
                          {milestone.due_date ? (
                            format(new Date(milestone.due_date), "PPP")
                          ) : (
                            <span className="text-muted-foreground">Select date</span>
                          )}
                          <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={milestone.due_date ? new Date(milestone.due_date) : undefined}
                          onSelect={(date) => updateMilestone(index, "due_date", date?.toISOString())}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Bid"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BidForm;
