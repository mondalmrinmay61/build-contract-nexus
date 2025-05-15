
import { format } from "date-fns";
import { Shield, ShieldCheck, ShieldX, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database } from "@/integrations/supabase/types";

type DisputeWithRelations = Database["public"]["Tables"]["disputes"]["Row"] & {
  contracts: Database["public"]["Tables"]["contracts"]["Row"] | null;
  raised_by: {
    name: string | null;
    user_type: string;
  } | null;
};

interface DisputesListProps {
  disputes: DisputeWithRelations[];
}

const DisputesList = ({ disputes }: DisputesListProps) => {
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" /> Open
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
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
              <TableCell>
                {dispute.contracts?.project_id ? (
                  <span className="font-medium">{dispute.contracts.project_id}</span>
                ) : (
                  "Unknown Project"
                )}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {dispute.reason}
              </TableCell>
              <TableCell>{getStatusBadge(dispute.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DisputesList;
