
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const walletRechargeSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  transaction_reference: z.string().min(3, "Transaction reference is required"),
  receipt: z.instanceof(File, { message: "Receipt screenshot is required" }).optional(),
});

const withdrawalRequestSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero"),
});

type WalletRechargeValues = z.infer<typeof walletRechargeSchema>;
type WithdrawalRequestValues = z.infer<typeof withdrawalRequestSchema>;

const WalletManagement = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const rechargeForm = useForm<WalletRechargeValues>({
    resolver: zodResolver(walletRechargeSchema),
    defaultValues: {
      amount: 0,
      transaction_reference: "",
    },
  });

  const withdrawalForm = useForm<WithdrawalRequestValues>({
    resolver: zodResolver(withdrawalRequestSchema),
    defaultValues: {
      amount: 0,
    },
  });

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Calculate wallet balance based on transaction history
      const { data: txData, error: txError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (txError) throw txError;

      setTransactions(txData || []);

      // Calculate balance
      let balance = 0;
      (txData || []).forEach((tx) => {
        if (tx.status === "approved") {
          if (tx.type === "recharge" || tx.type === "earning") {
            balance += tx.amount;
          } else if (tx.type === "withdrawal") {
            balance -= tx.amount;
          }
        }
      });
      setWalletBalance(balance);

      // Fetch withdrawal requests
      if (profile?.user_type === "contractor") {
        const { data: withdrawalData, error: withdrawalError } = await supabase
          .from("withdrawal_requests")
          .select("*")
          .eq("contractor_id", user.id)
          .order("created_at", { ascending: false });

        if (withdrawalError) throw withdrawalError;
        setWithdrawalRequests(withdrawalData || []);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      toast.error("Failed to load wallet data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const uploadReceipt = async (userId: string): Promise<string | null> => {
    if (!receiptFile) return null;

    const fileExt = receiptFile.name.split(".").pop();
    const fileName = `${userId}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, receiptFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from("receipts").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading receipt:", error);
      return null;
    }
  };

  const onRechargeSubmit = async (values: WalletRechargeValues) => {
    if (!user) return;

    try {
      let screenshot_url = null;
      if (receiptFile) {
        screenshot_url = await uploadReceipt(user.id);
        if (!screenshot_url) {
          toast.error("Failed to upload receipt");
          return;
        }
      }

      const { error } = await supabase
        .from("wallet_transactions")
        .insert({
          user_id: user.id,
          amount: values.amount,
          type: "recharge",
          status: "pending",
          transaction_reference: values.transaction_reference,
          screenshot_url,
        });

      if (error) throw error;

      setRechargeDialogOpen(false);
      rechargeForm.reset();
      setReceiptFile(null);
      toast.success("Recharge request submitted successfully");
      fetchWalletData();
    } catch (error: any) {
      console.error("Error submitting recharge request:", error);
      toast.error(error.message || "Failed to submit recharge request");
    }
  };

  const onWithdrawSubmit = async (values: WithdrawalRequestValues) => {
    if (!user || profile?.user_type !== "contractor") return;

    try {
      if (values.amount > walletBalance) {
        toast.error("Insufficient balance");
        return;
      }

      const { error } = await supabase
        .from("withdrawal_requests")
        .insert({
          contractor_id: user.id,
          amount: values.amount,
          status: "pending",
        });

      if (error) throw error;

      // Also create a wallet transaction with pending status
      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        amount: values.amount,
        type: "withdrawal",
        status: "pending",
      });

      setWithdrawDialogOpen(false);
      withdrawalForm.reset();
      toast.success("Withdrawal request submitted successfully");
      fetchWalletData();
    } catch (error: any) {
      console.error("Error submitting withdrawal request:", error);
      toast.error(error.message || "Failed to submit withdrawal request");
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

  const renderTransactionTable = () => {
    if (transactions.length === 0) {
      return <div className="text-center py-8">No transactions found.</div>;
    }

    return (
      <Table>
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
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>
                {format(new Date(tx.created_at), "MMM dd, yyyy")}
              </TableCell>
              <TableCell className="capitalize">{tx.type}</TableCell>
              <TableCell>
                ${tx.amount.toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    tx.status === "approved"
                      ? "success"
                      : tx.status === "rejected"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {tx.status}
                </Badge>
              </TableCell>
              <TableCell>{tx.transaction_reference || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderWithdrawalTable = () => {
    if (withdrawalRequests.length === 0) {
      return <div className="text-center py-8">No withdrawal requests found.</div>;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Admin Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {withdrawalRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                {format(new Date(request.created_at), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>${request.amount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    request.status === "approved"
                      ? "success"
                      : request.status === "rejected"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>{request.admin_notes || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Wallet Management</h1>

          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Balance</CardTitle>
                <CardDescription>
                  Your current available balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">${walletBalance.toFixed(2)}</div>
              </CardContent>
              <CardFooter className="flex gap-4">
                <Dialog
                  open={rechargeDialogOpen}
                  onOpenChange={setRechargeDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>Recharge Wallet</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Recharge Wallet</DialogTitle>
                      <DialogDescription>
                        Enter the details of your bank transfer to recharge your wallet.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...rechargeForm}>
                      <form
                        onSubmit={rechargeForm.handleSubmit(onRechargeSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={rechargeForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={rechargeForm.control}
                          name="transaction_reference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Transaction Reference</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Bank Transfer ID"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter the reference number of your bank transfer
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={rechargeForm.control}
                          name="receipt"
                          render={() => (
                            <FormItem>
                              <FormLabel>Receipt Screenshot</FormLabel>
                              <FormControl>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleReceiptChange}
                                />
                              </FormControl>
                              <FormDescription>
                                Upload a screenshot of your payment receipt
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <DialogFooter>
                          <Button type="submit">Submit Request</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {profile?.user_type === "contractor" && (
                  <Dialog
                    open={withdrawDialogOpen}
                    onOpenChange={setWithdrawDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline">Request Withdrawal</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Withdrawal</DialogTitle>
                        <DialogDescription>
                          Enter the amount you want to withdraw from your wallet.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...withdrawalForm}>
                        <form
                          onSubmit={withdrawalForm.handleSubmit(onWithdrawSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={withdrawalForm.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Amount ($)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    max={walletBalance}
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Maximum amount: ${walletBalance.toFixed(2)}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <DialogFooter>
                            <Button type="submit">Submit Request</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardFooter>
            </Card>
          </div>

          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="transactions">Transaction History</TabsTrigger>
              {profile?.user_type === "contractor" && (
                <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    A record of all your wallet transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>{renderTransactionTable()}</CardContent>
              </Card>
            </TabsContent>

            {profile?.user_type === "contractor" && (
              <TabsContent value="withdrawals">
                <Card>
                  <CardHeader>
                    <CardTitle>Withdrawal Requests</CardTitle>
                    <CardDescription>
                      A record of all your withdrawal requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>{renderWithdrawalTable()}</CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WalletManagement;
