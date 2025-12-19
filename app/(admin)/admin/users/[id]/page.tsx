"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAdminUserDetail, updateAdminUser, adjustUserBalance, banUser, resetUserPassword, getUserNetwork } from "@/lib/api-admin";
import { formatIDR } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import NetworkViewer from "@/components/admin/NetworkViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    tier_level: 0,
    is_active: false,
  });
  const [adjustBalanceOpen, setAdjustBalanceOpen] = useState(false);
  const [adjustBalanceData, setAdjustBalanceData] = useState({
    walletType: "DEPOSIT_LOCKED" as "DEPOSIT_LOCKED" | "AVAILABLE",
    action: "ADD" as "ADD" | "CUT",
    amount: "",
    notes: "",
    triggerBonus: false,
  });
  const [adjustingBalance, setAdjustingBalance] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [networkData, setNetworkData] = useState<any>(null);

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await getAdminUserDetail(params.id as string);
      if (response.success) {
        setUser(response.data);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat user",
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
  }, [params.id, toast, router]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      setFormData({
        tier_level: user.tier_level,
        is_active: user.is_active,
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const response: any = await updateAdminUser(params.id as string, formData);
      if (response.success) {
        toast({
          title: "Berhasil",
          description: "User berhasil diupdate",
        });
        loadUser();
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal update user",
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
      setUpdating(false);
    }
  };

  const getTierLabel = (tier: number) => {
    if (tier === 0) return "Free";
    if (tier === 1) return "Level 1";
    if (tier === 2) return "Level 2";
    if (tier === 3) return "Level 3";
    return `Tier ${tier}`;
  };

  const handleAdjustBalance = async () => {
    if (!adjustBalanceData.amount || parseFloat(adjustBalanceData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Amount harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    setAdjustingBalance(true);
    try {
      const response: any = await adjustUserBalance(params.id as string, {
        walletType: adjustBalanceData.walletType,
        action: adjustBalanceData.action,
        amount: parseFloat(adjustBalanceData.amount),
        notes: adjustBalanceData.notes,
        triggerBonus: adjustBalanceData.triggerBonus,
      });

      if (response.success) {
        toast({
          title: "Berhasil",
          description: "Saldo berhasil diupdate",
        });
        setAdjustBalanceOpen(false);
        setAdjustBalanceData({
          walletType: "DEPOSIT_LOCKED",
          action: "ADD",
          amount: "",
          notes: "",
          triggerBonus: false,
        });
        loadUser();
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal update saldo",
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
      setAdjustingBalance(false);
    }
  };

  const handleBanUser = async () => {
    try {
      // Jika user aktif, kita ingin ban dia (kirim banned = true)
      // Jika user tidak aktif, kita ingin unban dia (kirim banned = false)
      const shouldBan = user.is_active;
      const response: any = await banUser(params.id as string, shouldBan);
      if (response.success) {
        toast({
          title: "Berhasil",
          description: shouldBan ? "User berhasil di-ban" : "User berhasil di-unban",
        });
        loadUser();
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal update user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async () => {
    setResettingPassword(true);
    try {
      const response: any = await resetUserPassword(params.id as string);
      if (response.success) {
        setNewPassword(response.data.newPassword);
        setResetPasswordOpen(true);
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal reset password",
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
      setResettingPassword(false);
    }
  };

  const loadNetwork = async () => {
    try {
      const response: any = await getUserNetwork(params.id as string);
      if (response.success) {
        setNetworkData(response.data);
      }
    } catch (error) {
      console.error("Failed to load network:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">User Detail</h1>
          <p className="text-muted-foreground">{user.username}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Username:</span>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tier:</span>
              <Badge variant="outline">{getTierLabel(user.tier_level)}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              {user.is_active ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Joined:</span>
              <span>{new Date(user.created_at).toLocaleDateString("id-ID")}</span>
            </div>
            {user.sponsor && (
              <div>
                <span className="text-muted-foreground">Sponsor:</span>
                <p className="mt-1">{user.sponsor.username} ({user.sponsor.email})</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Downlines:</span>
              <p className="mt-1 font-medium">{user._count?.downlines || 0} users</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Transactions:</span>
              <p className="mt-1 font-medium">{user._count?.transactions || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Info */}
        {user.wallet && (
          <Card>
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available Balance:</span>
                <span className="font-bold text-green-600">
                  {formatIDR(user.wallet.balance_available)}
                </span>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Locked Balance:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposit:</span>
                    <span>{formatIDR(user.wallet.balance_deposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reward Task:</span>
                    <span>{formatIDR(user.wallet.balance_reward_task)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matching Bonus:</span>
                    <span>{formatIDR(user.wallet.balance_matching_lock)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total Locked:</span>
                    <span>
                      {formatIDR(
                        user.wallet.balance_deposit +
                          user.wallet.balance_reward_task +
                          user.wallet.balance_matching_lock
                      )}
                    </span>
                  </div>
                </div>
              </div>
              {user.wallet.unlock_date && (
                <div>
                  <span className="text-muted-foreground">Unlock Date:</span>
                  <p className="mt-1">
                    {new Date(user.wallet.unlock_date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Edit User */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Edit User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tier_level">Tier Level</Label>
              <Select
                value={formData.tier_level.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, tier_level: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Free</SelectItem>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select
                value={formData.is_active.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, is_active: value === "true" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? "Updating..." : "Update User"}
            </Button>
          </CardContent>
        </Card>

        {/* Balance Adjustment */}
        <Card>
          <CardHeader>
            <CardTitle>Balance Adjustment</CardTitle>
            <CardDescription>
              Tambah atau kurangi saldo user secara manual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setAdjustBalanceOpen(true)} variant="outline">
              Adjust Balance
            </Button>
          </CardContent>
        </Card>

        {/* User Actions */}
        <Card>
          <CardHeader>
            <CardTitle>User Actions</CardTitle>
            <CardDescription>
              Kelola akses dan keamanan user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleBanUser}
              variant={user.is_active ? "destructive" : "default"}
            >
              {user.is_active ? "Ban User" : "Unban User"}
            </Button>
            <Button
              onClick={handleResetPassword}
              variant="outline"
              disabled={resettingPassword}
            >
              {resettingPassword ? "Resetting..." : "Reset Password"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Network Viewer */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Network Tree</CardTitle>
          <CardDescription>
            Binary network structure untuk user ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadNetwork} variant="outline" className="mb-4">
            Load Network
          </Button>
          {networkData && <NetworkViewer networkData={networkData} />}
        </CardContent>
      </Card>

      {/* Adjust Balance Dialog */}
      <Dialog open={adjustBalanceOpen} onOpenChange={setAdjustBalanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Balance</DialogTitle>
            <DialogDescription>
              Tambah atau kurangi saldo user secara manual
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Wallet Type</Label>
              <Select
                value={adjustBalanceData.walletType}
                onValueChange={(value: "DEPOSIT_LOCKED" | "AVAILABLE") =>
                  setAdjustBalanceData({ ...adjustBalanceData, walletType: value, triggerBonus: false })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEPOSIT_LOCKED">Locked Deposit</SelectItem>
                  <SelectItem value="AVAILABLE">Available Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Action</Label>
              <Select
                value={adjustBalanceData.action}
                onValueChange={(value: "ADD" | "CUT") =>
                  setAdjustBalanceData({ ...adjustBalanceData, action: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADD">Add (+)</SelectItem>
                  <SelectItem value="CUT">Deduct (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (IDR)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={adjustBalanceData.amount}
                onChange={(e) =>
                  setAdjustBalanceData({ ...adjustBalanceData, amount: e.target.value })
                }
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={adjustBalanceData.notes}
                onChange={(e) =>
                  setAdjustBalanceData({ ...adjustBalanceData, notes: e.target.value })
                }
                placeholder="Catatan untuk adjustment ini..."
              />
            </div>
            {adjustBalanceData.walletType === "DEPOSIT_LOCKED" && adjustBalanceData.action === "ADD" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="triggerBonus"
                  checked={adjustBalanceData.triggerBonus}
                  onCheckedChange={(checked) =>
                    setAdjustBalanceData({ ...adjustBalanceData, triggerBonus: !!checked })
                  }
                />
                <Label htmlFor="triggerBonus" className="cursor-pointer">
                  Trigger Sponsor Bonus (10% dari amount)
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustBalanceOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustBalance} disabled={adjustingBalance}>
              {adjustingBalance ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Reset Success</DialogTitle>
            <DialogDescription>
              Password baru telah dibuat untuk user ini
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="flex items-center gap-2">
                <Input value={newPassword} readOnly className="font-mono" />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(newPassword);
                    toast({
                      title: "Copied",
                      description: "Password telah disalin ke clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Simpan password ini dan berikan ke user. Password tidak dapat dilihat lagi setelah dialog ini ditutup.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setResetPasswordOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

