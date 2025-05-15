
import { format } from "date-fns";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";

type DisputeWithRelations = Database["public"]["Tables"]["disputes"]["Row"] & {
  contracts: Database["public"]["Tables"]["contracts"]["Row"] | null;
  raised_by: {
    name: string | null;
    user_type: string;
  } | null;
};

interface DisputeDetailProps {
  dispute: DisputeWithRelations;
}

const DisputeDetail = ({ dispute }: DisputeDetailProps) => {
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
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <Shield className="h-3 w-3 mr-1" /> {status}
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Dispute Details
          </CardTitle>
          {getStatusBadge(dispute.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Raised By</h3>
          <p>{dispute.raised_by?.name || "Unknown User"}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Date Submitted</h3>
          <p>
            {dispute.created_at
              ? format(new Date(dispute.created_at), "MMMM d, yyyy")
              : "N/A"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Reason</h3>
          <p className="text-sm mt-1 whitespace-pre-wrap">{dispute.reason}</p>
        </div>

        {dispute.resolution_notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Resolution Notes</h3>
            <p className="text-sm mt-1 whitespace-pre-wrap">{dispute.resolution_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DisputeDetail;
