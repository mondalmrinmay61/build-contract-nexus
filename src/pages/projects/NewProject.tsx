
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarDays, ChevronDown, Plus } from "lucide-react";
import { format } from "date-fns";

import { useAuth } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import MilestoneForm from "@/components/projects/MilestoneForm";
import { Database } from "@/integrations/supabase/types";

// Define type for milestone
type Milestone = {
  description: string;
  amount: number;
  due_date: Date | null;
  order_index: number;
};

// Create project schema with Zod
const projectSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  location: z.string().min(3, { message: "Location is required" }),
  budget: z.coerce.number().positive({ message: "Budget must be a positive number" }),
  deadline: z.date({ required_error: "Deadline is required" }),
  category_id: z.string({ required_error: "Category is required" }),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const NewProject = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [categories, setCategories] = useState<Database["public"]["Tables"]["categories"]["Row"][]>([]);
  
  // Initialize the form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      budget: 0,
      category_id: "",
    },
  });

  // Fetch categories on component mount
  useState(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        if (data) setCategories(data);
      } catch (error: any) {
        toast({
          title: "Error loading categories",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchCategories();
  }, []);

  // Add milestone to the list
  const addMilestone = (milestone: Milestone) => {
    setMilestones([...milestones, milestone]);
  };

  // Remove milestone from the list
  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  // Handle form submission
  const onSubmit = async (data: ProjectFormValues) => {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to post a project",
        variant: "destructive",
      });
      return;
    }

    if (milestones.length === 0) {
      toast({
        title: "Milestones required",
        description: "Please add at least one milestone for your project",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          client_id: user.id,
          title: data.title,
          description: data.description,
          location: data.location,
          budget: data.budget,
          deadline: data.deadline.toISOString(),
          category_id: data.category_id,
          status: "open",
        })
        .select()
        .single();

      if (projectError) throw projectError;
      if (!projectData) throw new Error("Failed to create project");

      // Insert milestones
      const milestonesWithProjectId = milestones.map((milestone) => ({
        project_id: projectData.id,
        description: milestone.description,
        amount: milestone.amount,
        due_date: milestone.due_date ? milestone.due_date.toISOString() : null,
        order_index: milestone.order_index,
        status: "pending",
      }));

      const { error: milestonesError } = await supabase
        .from("milestones")
        .insert(milestonesWithProjectId);

      if (milestonesError) throw milestonesError;

      toast({
        title: "Project created",
        description: "Your project has been posted successfully",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user is a client
  if (profile?.user_type !== "client") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
              <p className="text-gray-600">
                Only clients can post new projects. Please contact support if you believe this is an error.
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/dashboard")}
              >
                Return to Dashboard
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Post a New Project</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project title" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear and concise title for your project.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your project requirements in detail"
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide detailed information about your project.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Project location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget ($ USD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter budget amount"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Deadline</FormLabel>
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
                                  <span>Select a deadline</span>
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
                  
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Project Milestones</h3>
                    <MilestoneForm onAddMilestone={addMilestone} />
                  </div>
                  
                  {milestones.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500">No milestones added yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Click "Add Milestone" to create project deliverables
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {milestones.map((milestone, index) => (
                        <Card key={index} className="relative">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md">
                              Milestone {index + 1}: {milestone.description}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between text-sm">
                              <span>
                                <strong>Amount:</strong> ${milestone.amount}
                              </span>
                              <span>
                                <strong>Due:</strong>{" "}
                                {milestone.due_date
                                  ? format(milestone.due_date, "PPP")
                                  : "No date set"}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeMilestone(index)}
                            >
                              Remove
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-5 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || milestones.length === 0}
                  >
                    {isSubmitting ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewProject;
