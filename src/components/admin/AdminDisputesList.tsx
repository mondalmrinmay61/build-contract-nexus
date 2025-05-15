
import { useState } from "react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DisputeWithRelations {
  id: string;
  reason: string;
  status: string | null;
  created_at: string | null;
  resolution_notes: string | null;
  raised_by: {
    name: string | null;
    user_type: string;
  } | null;
  contracts: {
    id: string;
    project_id: string | null;
    contractor_id: string | null;
  } | null;
  projects: {
    title: string;
  } | null;
}

const AdminDisputesList = () => {
  const queryClient = useQueryClient();
  const [selectedDispute, setSelectedDispute] = useState<DisputeWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [newStatus, setNewStatus] = useState<string>("resolved");

  const { data: disputes, isLoading } = useQuery({
    queryKey: ["admin-disputes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disputes")
        .select(`
          *,
          contracts:contract_id (*),
          raised_by:raised_by_id (name, user_type),
          projects:contracts.project_id (title)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return data as DisputeWithRelations[];
    },
  });

  const updateDisputeMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const { error } = await supabase
        .from("disputes")
        .update({
          status,
          resolution_notes: notes,
        })
        .eq("id", id);

      if (error) throw error;
      return { id, status, notes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] });
      setIsDialogOpen(false);
      toast({
        title: "Dispute updated",
        description: "The dispute has been successfully updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update dispute",
        variant: "destructive",
      });
    },
  });

  const handleResolveDispute = () => {
    if (!selectedDispute) return;

    updateDisputeMutation.mutate({
      id: selectedDispute.id,
      status: newStatus,
      notes: resolutionNotes,
    });
  };

  const openResolveDialog = (dispute: DisputeWithRelations) => {
    setSelectedDispute(dispute);
    setResolutionNotes(dispute.resolution_notes || "");
    setNewStatus(dispute.status || "resolved");
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <ShieldAlert className="h-3 w-3 mr-1" /> Open
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <ShieldCheck className="h-3 w-3 mr-1" /> Resolved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <ShieldX className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <Shield className="h-3 w-3 mr-1" /> {status}
          </Badge>
        );
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Manage Disputes</h2>
          <p className="text-gray-500 text-sm">Review and resolve platform disputes</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">Loading disputes...</div>
        ) : disputes && disputes.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell className="font-medium">
                      {dispute.created_at
                        ? format(new Date(dispute.created_at), "MMM d, yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell>{dispute.raised_by?.name || "Unknown"}</TableCell>
                    <TableCell>{dispute.projects?.title || "Unknown Project"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {dispute.reason}
                    </TableCell>
                    <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResolveDialog(dispute)}
                        disabled={dispute.status === "resolved"}
                      >
                        {dispute.status === "open" ? "Resolve" : "View"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No disputes found</p>
          </div>
        )}
      </div>

      {selectedDispute && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Resolve Dispute</DialogTitle>
              <DialogDescription>
                Review and update the status of this dispute.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Raised By</h3>
                <p>{selectedDispute.raised_by?.name || "Unknown User"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Reason</h3>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedDispute.reason}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Update Status</h3>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Resolution Notes</h3>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Add notes about the resolution..."
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleResolveDispute}
                disabled={updateDisputeMutation.isPending}
              >
                {updateDisputeMutation.isPending ? "Updating..." : "Update Dispute"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AdminDisputesList;
