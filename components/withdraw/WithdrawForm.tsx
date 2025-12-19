"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { withdraw } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useWalletStore } from "@/store/walletStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BANK_LIST,
  MIN_WITHDRAW_AMOUNT,
  WITHDRAW_ADMIN_FEE,
} from "@/lib/constants";
import { formatIDR, formatInputIDR } from "@/lib/format";
import { Banknote, ShieldCheck } from "lucide-react";

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
  const amountNum = formData.amount
    ? parseFloat(formData.amount.replace(/\./g, ""))
    : 0;

  const receivedAmount = Math.max(amountNum - WITHDRAW_ADMIN_FEE, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.bank_name ||
      !formData.bank_account ||
      !formData.account_name ||
      !formData.amount
    ) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive",
      });
      return;
    }

    if (amountNum < MIN_WITHDRAW_AMOUNT) {
      toast({
        title: "Error",
        description: `Minimal withdraw ${formatIDR(MIN_WITHDRAW_AMOUNT)}`,
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
    setLoading(true);
    setShowConfirm(false);

    try {
      const res = await withdraw({
        amount: amountNum,
        bank_name: formData.bank_name,
        bank_account: formData.bank_account,
        account_name: formData.account_name,
      });

      if (res.success) {
        updateBalance({
          balance_available: availableBalance - amountNum,
        });

        toast({
          title: "Withdraw Diajukan",
          description: "Permintaan withdraw berhasil dikirim ke admin",
        });

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
          description: res.message || "Withdraw gagal",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Terjadi kesalahan sistem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= FORM CARD ================= */}
      <Card className="bg-black/40 border border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <Banknote className="h-5 w-5 text-green-400" />
            Form Withdraw
          </CardTitle>
          <CardDescription className="text-gray-400">
            Tarik saldo dari Available Balance ke rekening bank
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* AVAILABLE BALANCE */}
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">
                  Available Balance
                </span>
                <span className="text-xl font-bold text-green-400">
                  {formatIDR(availableBalance)}
                </span>
              </div>
            </div>

            {/* BANK SELECT (DARK FIX) */}
            <div className="space-y-2">
              <Label>Bank</Label>
              <Select
                value={formData.bank_name}
                onValueChange={(v) =>
                  setFormData({ ...formData, bank_name: v })
                }
              >
                <SelectTrigger
                  className="
                    bg-black/40
                    border border-white/10
                    text-white
                    backdrop-blur
                    focus:ring-1
                    focus:ring-green-400/40
                    [&>svg]:text-green-400
                  "
                >
                  <SelectValue placeholder="Pilih bank" />
                </SelectTrigger>

                <SelectContent
                  className="
                    bg-black/90
                    border border-white/10
                    text-white
                    backdrop-blur-xl
                  "
                >
                  {BANK_LIST.map((bank) => (
                    <SelectItem
                      key={bank}
                      value={bank}
                      className="
                        cursor-pointer
                        focus:bg-green-500/20
                        hover:bg-green-500/10
                        focus:text-white
                      "
                    >
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* REKENING */}
            <div className="space-y-2">
              <Label>Nomor Rekening</Label>
              <Input
                value={formData.bank_account}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bank_account: e.target.value.replace(/\D/g, ""),
                  })
                }
                placeholder="Masukkan nomor rekening"
                inputMode="numeric"
                className="bg-black/40 border-white/10 text-white"
              />
            </div>

            {/* NAMA */}
            <div className="space-y-2">
              <Label>Nama Pemilik Rekening</Label>
              <Input
                value={formData.account_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    account_name: e.target.value,
                  })
                }
                placeholder="Sesuai buku tabungan"
                className="bg-black/40 border-white/10 text-white"
              />
            </div>

            {/* AMOUNT */}
            <div className="space-y-2">
              <Label>Jumlah Withdraw</Label>
              <Input
                value={formData.amount ? formatInputIDR(formData.amount) : ""}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d]/g, "");
                  setFormData({ ...formData, amount: v });
                }}
                placeholder={formatIDR(MIN_WITHDRAW_AMOUNT).replace("Rp ", "")}
                className="font-mono bg-black/40 border-white/10 text-white"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Min: {formatIDR(MIN_WITHDRAW_AMOUNT)}</span>
                <span>Max: {formatIDR(availableBalance)}</span>
              </div>
            </div>

            {/* FEE */}
            {WITHDRAW_ADMIN_FEE > 0 && (
              <div className="rounded-lg bg-white/5 p-3 text-sm">
                <div className="flex justify-between">
                  <span>Biaya Admin</span>
                  <span>{formatIDR(WITHDRAW_ADMIN_FEE)}</span>
                </div>
                <div className="flex justify-between font-bold mt-1">
                  <span>Diterima</span>
                  <span className="text-green-400">
                    {formatIDR(receivedAmount)}
                  </span>
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
              <p className="text-xs text-center text-gray-400">
                Saldo belum mencukupi untuk withdraw
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* ================= CONFIRM DIALOG ================= */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-400" />
              Konfirmasi Withdraw
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Pastikan data sudah benar sebelum melanjutkan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Bank</span>
              <span className="font-medium">{formData.bank_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Rekening</span>
              <span className="font-medium">{formData.bank_account}</span>
            </div>
            <div className="flex justify-between">
              <span>Nama</span>
              <span className="font-medium">{formData.account_name}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
              <span className="font-bold">Jumlah</span>
              <span className="font-bold text-green-400">
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
