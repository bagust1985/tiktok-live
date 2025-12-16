"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { withdraw } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useWalletStore } from "@/store/walletStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BANK_LIST, MIN_WITHDRAW_AMOUNT, WITHDRAW_ADMIN_FEE } from "@/lib/constants";
import { formatIDR, formatInputIDR } from "@/lib/format";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function WithdrawForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { wallet, updateBalance } = useWalletStore();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: "",
    bank_account: "",
    account_name: "",
    amount: "",
  });

  const availableBalance = wallet?.balance_available || 0;
  const amountNum = formData.amount ? parseFloat(formData.amount.replace(/\./g, "")) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bank_name || !formData.bank_account || !formData.account_name || !formData.amount) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field",
        variant: "destructive",
      });
      return;
    }

    if (amountNum < MIN_WITHDRAW_AMOUNT) {
      toast({
        title: "Error",
        description: `Minimum withdraw adalah ${formatIDR(MIN_WITHDRAW_AMOUNT)}`,
        variant: "destructive",
      });
      return;
    }

    if (amountNum > availableBalance) {
      toast({
        title: "Error",
        description: "Saldo tidak mencukupi",
        variant: "destructive",
      });
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const response = await withdraw({
        amount: amountNum,
        bank_name: formData.bank_name,
        bank_account: formData.bank_account,
        account_name: formData.account_name,
      });

      if (response.success) {
        // Update wallet balance (subtract from available)
        updateBalance({
          balance_available: availableBalance - amountNum,
        });

        toast({
          title: "Berhasil",
          description: "Withdraw berhasil diajukan. Menunggu proses admin.",
        });

        // Reset form
        setFormData({
          bank_name: "",
          bank_account: "",
          account_name: "",
          amount: "",
        });

        router.push("/wallet");
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal mengajukan withdraw",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengajukan withdraw",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Form Withdraw</CardTitle>
          <CardDescription>
            Tarik saldo dari Available Balance ke rekening bank Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Available Balance:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatIDR(availableBalance)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank</Label>
              <Select
                value={formData.bank_name}
                onValueChange={(value) =>
                  setFormData({ ...formData, bank_name: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bank" />
                </SelectTrigger>
                <SelectContent>
                  {BANK_LIST.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_account">Nomor Rekening</Label>
              <Input
                id="bank_account"
                type="text"
                placeholder="Masukkan nomor rekening"
                value={formData.bank_account}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bank_account: e.target.value.replace(/\D/g, ""),
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_name">Nama Pemilik Rekening</Label>
              <Input
                id="account_name"
                type="text"
                placeholder="Nama sesuai buku tabungan"
                value={formData.account_name}
                onChange={(e) =>
                  setFormData({ ...formData, account_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah Withdraw</Label>
              <Input
                id="amount"
                type="text"
                placeholder={formatIDR(MIN_WITHDRAW_AMOUNT).replace("Rp ", "")}
                value={formData.amount ? formatInputIDR(formData.amount) : ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, "");
                  setFormData({ ...formData, amount: value });
                }}
                required
                className="font-mono"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: {formatIDR(MIN_WITHDRAW_AMOUNT)}</span>
                <span>Max: {formatIDR(availableBalance)}</span>
              </div>
            </div>

            {WITHDRAW_ADMIN_FEE > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Biaya Admin:</span>
                  <span className="font-medium">{formatIDR(WITHDRAW_ADMIN_FEE)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold mt-1">
                  <span>Jumlah Diterima:</span>
                  <span>{formatIDR(amountNum - WITHDRAW_ADMIN_FEE)}</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || availableBalance < MIN_WITHDRAW_AMOUNT}
            >
              {loading ? "Memproses..." : "Ajukan Withdraw"}
            </Button>

            {availableBalance < MIN_WITHDRAW_AMOUNT && (
              <p className="text-xs text-muted-foreground text-center">
                Saldo tidak mencukupi untuk withdraw
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Withdraw</DialogTitle>
            <DialogDescription>
              Pastikan data rekening sudah benar sebelum melanjutkan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <div className="flex justify-between">
              <span className="text-sm">Bank:</span>
              <span className="font-medium">{formData.bank_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Nomor Rekening:</span>
              <span className="font-medium">{formData.bank_account}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Nama Pemilik:</span>
              <span className="font-medium">{formData.account_name}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-bold">Jumlah:</span>
              <span className="font-bold text-primary">
                {formatIDR(amountNum)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? "Memproses..." : "Konfirmasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

