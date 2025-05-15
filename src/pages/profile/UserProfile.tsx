
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneInput } from "@/components/ui/phone-input";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z.string().optional(),
  company_name: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const UserProfile = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      company_name: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (profile && !loading) {
      form.reset({
        name: profile.name || "",
        email: profile.email || "",
        bio: profile.bio || "",
        company_name: profile.company_name || "",
        phone: profile.phone || "",
      });

      if (profile.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
    }
  }, [profile, loading, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;

    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${userId}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return null;
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      let avatar_url = profile?.avatar_url || null;
      
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar(user.id);
        if (newAvatarUrl) {
          avatar_url = newAvatarUrl;
        }
      }

      const profileData = {
        ...data,
        avatar_url,
        updated_at: new Date().toISOString(), // Convert Date to string
      };

      // Update profile in Supabase
      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id);

      if (error) throw error;

      // Refresh profile data by refetching from database
      const { data: refreshedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (refreshedProfile) {
        // If your AuthContext has a refreshProfile or similar method, use that instead
        // This is a workaround since updateProfile is not available
        // We'll reload the page to refresh the profile data
        window.location.reload();
      }

      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="general">General Information</TabsTrigger>
              {profile?.user_type === "contractor" && (
                <TabsTrigger value="skills">Skills & Experience</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="general">
              <div className="grid gap-8 md:grid-cols-3">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Profile Photo</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={avatarUrl || ""} />
                      <AvatarFallback>
                        {profile?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col w-full gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                      <p className="text-xs text-gray-500">
                        Recommended: Square JPG or PNG, max 1MB
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Your email"
                                  {...field}
                                  disabled
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your phone number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {profile?.user_type === "client" && (
                          <FormField
                            control={form.control}
                            name="company_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Your company name"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us about yourself or your company"
                                  className="resize-none min-h-[120px]"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={isUpdating}
                            className="w-full md:w-auto"
                          >
                            {isUpdating ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {profile?.user_type === "contractor" && (
              <TabsContent value="skills">
                <ContractorSkills userId={user.id} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Contractor Skills component
const ContractorSkills = ({ userId }: { userId: string }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
        
        if (categoriesData?.length > 0) {
          setSelectedCategory(categoriesData[0].id);
        }

        // Fetch user skills
        const { data: userSkillsData, error: userSkillsError } = await supabase
          .from("contractor_skills")
          .select("skill_id")
          .eq("contractor_id", userId);

        if (userSkillsError) throw userSkillsError;
        setUserSkills((userSkillsData || []).map(item => item.skill_id));

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load skills data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    const fetchSkillsByCategory = async () => {
      if (!selectedCategory) return;
      
      try {
        const { data, error } = await supabase
          .from("skills")
          .select("*")
          .eq("category_id", selectedCategory)
          .order("name");

        if (error) throw error;
        setSkills(data || []);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    fetchSkillsByCategory();
  }, [selectedCategory]);

  const handleSkillToggle = async (skillId: string) => {
    const isSelected = userSkills.includes(skillId);
    
    try {
      setIsSaving(true);
      
      if (isSelected) {
        // Remove skill
        const { error } = await supabase
          .from("contractor_skills")
          .delete()
          .eq("contractor_id", userId)
          .eq("skill_id", skillId);
        
        if (error) throw error;
        
        // Update local state
        setUserSkills(userSkills.filter(id => id !== skillId));
        toast.success("Skill removed successfully");
      } else {
        // Add skill
        const { error } = await supabase
          .from("contractor_skills")
          .insert({
            contractor_id: userId,
            skill_id: skillId
          });
        
        if (error) throw error;
        
        // Update local state
        setUserSkills([...userSkills, skillId]);
        toast.success("Skill added successfully");
      }
    } catch (error) {
      console.error("Error updating skill:", error);
      toast.error("Failed to update skill");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center">Loading skills...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & Expertise</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Category
            </label>
            <select
              className="w-full p-2 border rounded-md"
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Available Skills</h3>
            {skills.length === 0 ? (
              <p className="text-gray-500">No skills found for this category.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {skills.map((skill) => {
                  const isSelected = userSkills.includes(skill.id);
                  return (
                    <div
                      key={skill.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-white hover:bg-gray-50"
                      }`}
                      onClick={() => handleSkillToggle(skill.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{skill.name}</span>
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
