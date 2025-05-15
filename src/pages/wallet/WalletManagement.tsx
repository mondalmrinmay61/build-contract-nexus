
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
  transaction_reference?: string;
}

const WalletManagement = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("transactions");
  
  // Fetch wallet balance 
  const { data: walletBalanceData } = useQuery({
    queryKey: ["wallet-balance", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { balance: 0, pendingBalance: 0 };
      
      // In a real app, you would have a proper wallet balance table or view
      // For now, let's calculate from transactions
      const { data: deposits } = await supabase
        .from("wallet_transactions")
        .select("amount")
        .eq("user_id", profile.id)
        .eq("type", "deposit")
        .eq("status", "completed");
      
      const { data: withdrawals } = await supabase
        .from("wallet_transactions")
        .select("amount")
        .eq("user_id", profile.id)
        .eq("type", "withdrawal")
        .eq("status", "completed");
        
      const { data: pendingDeposits } = await supabase
        .from("wallet_transactions")
        .select("amount")
        .eq("user_id", profile.id)
        .eq("type", "deposit")
        .eq("status", "pending");
      
      // Calculate totals
      const depositsTotal = deposits?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const withdrawalsTotal = withdrawals?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const pendingTotal = pendingDeposits?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      
      return {
        balance: depositsTotal - withdrawalsTotal,
        pendingBalance: pendingTotal
      };
    },
    enabled: !!profile?.id,
  });
  
  // Fetch transactions
  const { data: transactions } = useQuery({
    queryKey: ["wallet-transactions", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });
        
      return data as Transaction[] || [];
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Wallet className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Wallet</h1>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Wallet Balance</CardTitle>
                <CardDescription>Your current funds</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-3xl font-bold">₹{walletBalanceData?.balance?.toFixed(2) || "0.00"}</p>
                  </div>
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {profile?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {(walletBalanceData?.pendingBalance ?? 0) > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <p className="text-sm text-yellow-700">Pending Balance</p>
                    </div>
                    <p className="text-lg font-semibold text-yellow-800">₹{walletBalanceData?.pendingBalance.toFixed(2)}</p>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Button className="flex gap-2">
                    <ArrowDownCircle className="h-4 w-4" /> Add Funds
                  </Button>
                  <Button variant="outline" className="flex gap-2">
                    <ArrowUpCircle className="h-4 w-4" /> Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your funds</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button variant="outline" className="justify-start">Payment History</Button>
                <Button variant="outline" className="justify-start">Withdrawal Settings</Button>
                <Button variant="outline" className="justify-start">Tax Documents</Button>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your recent payment activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>A list of your recent transactions.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions && transactions.length > 0 ? (
                        transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{format(new Date(transaction.created_at), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>
                              {transaction.type === 'deposit' ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <ArrowDownCircle className="h-3 w-3 mr-1" /> Deposit
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  <ArrowUpCircle className="h-3 w-3 mr-1" /> Withdrawal
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              ₹{transaction.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(transaction.status)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {transaction.transaction_reference || "-"}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No transactions yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="withdrawals">
              <Card>
                <CardHeader>
                  <CardTitle>Withdrawal History</CardTitle>
                  <CardDescription>Track your withdrawals</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Implement withdrawal history here */}
                  <div className="text-center py-8 text-muted-foreground">
                    No withdrawals yet
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Complete
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" /> Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
};

export default WalletManagement;
