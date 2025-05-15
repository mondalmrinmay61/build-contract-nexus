
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const MessagesPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
      markMessagesAsRead(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchContacts = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get unique users from both sent and received messages
      const { data: sentData, error: sentError } = await supabase
        .from("messages")
        .select("receiver_id")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (sentError) throw sentError;

      const { data: receivedData, error: receivedError } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (receivedError) throw receivedError;

      // Extract unique user IDs
      const uniqueUserIds = new Set<string>();
      (sentData || []).forEach((item) => uniqueUserIds.add(item.receiver_id));
      (receivedData || []).forEach((item) => uniqueUserIds.add(item.sender_id));

      if (uniqueUserIds.size === 0) {
        setContacts([]);
        setIsLoading(false);
        return;
      }

      // Get user profiles for these IDs
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", Array.from(uniqueUserIds));

      if (profilesError) throw profilesError;

      // Get unread message counts
      const contactsWithUnread = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count, error } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("sender_id", profile.id)
            .eq("receiver_id", user.id)
            .eq("read", false);

          return {
            ...profile,
            unread: count || 0,
          };
        })
      );

      setContacts(contactsWithUnread);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load contacts");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    if (!user) return;

    try {
      // Get messages between the current user and the selected contact
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const markMessagesAsRead = async (senderId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("sender_id", senderId)
        .eq("receiver_id", user.id)
        .eq("read", false);

      if (error) throw error;

      // Update the unread count in the contacts list
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.id === senderId ? { ...contact, unread: 0 } : contact
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedContact || !newMessage.trim()) return;

    setIsSending(true);
    try {
      let attachment_url = null;
      if (attachmentFile) {
        attachment_url = await uploadAttachment(attachmentFile);
      }

      const { data, error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: selectedContact.id,
        message: newMessage.trim(),
        attachment_url,
        read: false,
      });

      if (error) throw error;

      setNewMessage("");
      setAttachmentFile(null);
      fetchMessages(selectedContact.id);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const uploadAttachment = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${user?.id}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("attachments").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading attachment:", error);
      toast.error("Failed to upload attachment");
      return null;
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        return;
      }
      setAttachmentFile(file);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`name.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .neq("id", user?.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };

  const startNewConversation = (profile: any) => {
    setSelectedContact(profile);
    setSearchResults([]);
    setShowNewMessageDialog(false);
    
    // Check if this contact already exists in the contacts list
    const existingContact = contacts.find(c => c.id === profile.id);
    if (!existingContact) {
      setContacts([...contacts, { ...profile, unread: 0 }]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading...</p>
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
      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Messages</h1>
            <Dialog
              open={showNewMessageDialog}
              onOpenChange={setShowNewMessageDialog}
            >
              <DialogTrigger asChild>
                <Button>New Message</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                  <DialogDescription>
                    Search for users to start a new conversation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search by name, company or email"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearchUsers()}
                    />
                    <Button
                      onClick={handleSearchUsers}
                      disabled={isSearching || searchQuery.length < 3}
                    >
                      Search
                    </Button>
                  </div>
                  {isSearching ? (
                    <div className="text-center py-4">Searching...</div>
                  ) : (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {searchResults.length === 0 && searchQuery.length >= 3 && (
                          <div className="text-center py-4">No users found</div>
                        )}
                        {searchResults.map((profile) => (
                          <div
                            key={profile.id}
                            className="flex items-center p-3 hover:bg-gray-100 rounded-md cursor-pointer"
                            onClick={() => startNewConversation(profile)}
                          >
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={profile.avatar_url || ""} />
                              <AvatarFallback>
                                {profile.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{profile.name}</p>
                              <p className="text-sm text-gray-500">
                                {profile.company_name || profile.email}
                              </p>
                            </div>
                            <Badge className="ml-auto">
                              {profile.user_type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewMessageDialog(false)}
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading contacts...</div>
                ) : contacts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="mb-4">No conversations yet</p>
                    <Button
                      onClick={() => setShowNewMessageDialog(true)}
                    >
                      Start a Conversation
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-2">
                      {contacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`flex items-center p-3 rounded-md cursor-pointer ${
                            selectedContact?.id === contact.id
                              ? "bg-primary/10"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => setSelectedContact(contact)}
                        >
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={contact.avatar_url || ""} />
                            <AvatarFallback>
                              {contact.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="font-medium truncate">
                                {contact.name || contact.email}
                              </p>
                              {contact.unread > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                  {contact.unread}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {contact.company_name || contact.user_type}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="border-b">
                {selectedContact ? (
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={selectedContact.avatar_url || ""} />
                      <AvatarFallback>
                        {selectedContact.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedContact.name || selectedContact.email}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {selectedContact.company_name || selectedContact.user_type}
                      </p>
                    </div>
                  </div>
                ) : (
                  <CardTitle>Select a conversation</CardTitle>
                )}
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[500px]">
                {!selectedContact ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      Select a contact to start chatting
                    </p>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500">
                              No messages yet. Start the conversation!
                            </p>
                          </div>
                        ) : (
                          messages.map((msg) => {
                            const isCurrentUser = msg.sender_id === user.id;
                            return (
                              <div
                                key={msg.id}
                                className={`flex ${
                                  isCurrentUser ? "justify-end" : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-[70%] rounded-lg p-3 ${
                                    isCurrentUser
                                      ? "bg-primary text-white"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  <p className="break-words">{msg.message}</p>
                                  {msg.attachment_url && (
                                    <div className="mt-2">
                                      <a
                                        href={msg.attachment_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm underline flex items-center"
                                      >
                                        Attachment
                                      </a>
                                    </div>
                                  )}
                                  <p
                                    className={`text-xs mt-1 ${
                                      isCurrentUser
                                        ? "text-primary-foreground/80"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {format(
                                      new Date(msg.created_at),
                                      "MMM d, h:mm a"
                                    )}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    <div className="p-4 border-t">
                      <form
                        onSubmit={handleSendMessage}
                        className="flex flex-col space-y-2"
                      >
                        <Textarea
                          placeholder="Type your message here..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Input
                              type="file"
                              id="attachment"
                              className="hidden"
                              onChange={handleAttachmentChange}
                            />
                            <label
                              htmlFor="attachment"
                              className="flex items-center cursor-pointer text-sm text-gray-500 hover:text-gray-700"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {attachmentFile
                                ? attachmentFile.name.substring(0, 20) +
                                  (attachmentFile.name.length > 20 ? "..." : "")
                                : "Attach File"}
                            </label>
                          </div>
                          <Button
                            type="submit"
                            disabled={
                              isSending || (!newMessage.trim() && !attachmentFile)
                            }
                          >
                            {isSending ? "Sending..." : "Send"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </>
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

export default MessagesPage;
