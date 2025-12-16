"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAdminTransactionDetail, approveTransaction, rejectTransaction } from "@/lib/api-admin";
import { formatIDR } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadTransaction();
  }, [params.id]);

  const loadTransaction = async () => {
    setLoading(true);
    try {
      const response = await getAdminTransactionDetail(params.id as string);
      if (response.success) {
        setTransaction(response.data);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat transaction",
          variant: "destructive",
        });
        router.back();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setApproveLoading(true);
    try {
      const response = await approveTransaction(params.id as string);
      if (response.success) {
        toast({
          title: "Berhasil",
          description: "Transaction berhasil disetujui",
        });
        loadTransaction();
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal menyetujui transaction",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async () => {
    setRejectLoading(true);
    try {
      const response = await rejectTransaction(params.id as string, rejectReason);
      if (response.success) {
        toast({
          title: "Berhasil",
          description: "Transaction berhasil ditolak",
        });
        setShowRejectDialog(false);
        setRejectReason("");
        loadTransaction();
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal menolak transaction",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setRejectLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <Badge variant="success">Success</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DEPOSIT: "Deposit",
      WD_AVAILABLE: "Withdraw Available",
      WD_LOCKED: "Withdraw Locked",
      BONUS_SPONSOR: "Bonus Sponsor",
      BONUS_PAIRING: "Bonus Pairing",
      BONUS_MATCHING: "Bonus Matching",
      REWARD_TASK: "Reward Task",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  if (!transaction) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Transaction Detail</h1>
          <p className="text-muted-foreground">ID: {transaction.id}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Transaction Info */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{getTypeLabel(transaction.type)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-bold text-lg">{formatIDR(transaction.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              {getStatusBadge(transaction.status)}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{new Date(transaction.created_at).toLocaleString("id-ID")}</span>
            </div>
            {transaction.notes && (
              <div>
                <span className="text-muted-foreground">Notes:</span>
                <p className="mt-1">{transaction.notes}</p>
              </div>
            )}
            {transaction.rejected_reason && (
              <div>
                <span className="text-muted-foreground">Rejection Reason:</span>
                <p className="mt-1 text-red-600">{transaction.rejected_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Username:</span>
              <span className="font-medium">{transaction.user.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{transaction.user.email}</span>
            </div>
            {transaction.user.wallet && (
              <>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Wallet Balance:</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span className="font-medium text-green-600">
                        {formatIDR(transaction.user.wallet.balance_available)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Locked:</span>
                      <span className="font-medium text-orange-600">
                        {formatIDR(
                          transaction.user.wallet.balance_deposit +
                            transaction.user.wallet.balance_reward_task +
                            transaction.user.wallet.balance_matching_lock
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deposit Proof or Withdrawal Info */}
      {transaction.type === "DEPOSIT" && transaction.proof_image_url && (
        <Card>
          <CardHeader>
            <CardTitle>Proof of Payment</CardTitle>
          </CardHeader>
          <CardContent>
              {transaction.proof_image_url && transaction.proof_image_url.includes('data:image') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={transaction.proof_image_url}
                alt="Proof of payment"
                className="max-w-md rounded-lg border"
              />
            ) : (
              <p className="text-muted-foreground">Proof image tidak tersedia</p>
            )}
          </CardContent>
        </Card>
      )}

      {(transaction.type === "WD_AVAILABLE" || transaction.type === "WD_LOCKED") && (
        <Card>
          <CardHeader>
            <CardTitle>Bank Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bank:</span>
              <span className="font-medium">{transaction.bank_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Number:</span>
              <span className="font-mono">{transaction.bank_account}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Name:</span>
              <span>{transaction.account_name}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {transaction.status === "PENDING" && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={handleApprove}
                disabled={approveLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {approveLoading ? "Processing..." : "Approve"}
              </Button>
              <Button
                onClick={() => setShowRejectDialog(true)}
                disabled={rejectLoading}
                variant="destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transaction</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan transaction ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Alasan penolakan"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
              }}
              disabled={rejectLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectLoading || !rejectReason}
            >
              {rejectLoading ? "Processing..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

