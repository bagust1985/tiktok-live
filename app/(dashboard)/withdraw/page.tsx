"use client";

import { useEffect } from "react";
import { useWalletStore } from "@/store/walletStore";
import { getWalletBalance } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import WithdrawForm from "@/components/withdraw/WithdrawForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Clock } from "lucide-react";

export default function WithdrawPage() {
  const { wallet, setWallet } = useWalletStore();

  useEffect(() => {
    getWalletBalance().then((response: any) => {
      if (response.success) {
        setWallet(response.data);
      }
    });
  }, [setWallet]);

  const totalLocked =
    (wallet?.balance_deposit || 0) +
    (wallet?.balance_reward_task || 0) +
    (wallet?.balance_matching_lock || 0);

  const daysUntilUnlock = wallet?.unlock_date
    ? Math.ceil(
        (new Date(wallet.unlock_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Withdraw</h1>
        <p className="text-muted-foreground">
          Tarik saldo ke rekening bank Anda
        </p>
      </div>

      {/* Available Balance Display */}
      <Card className="border-green-500 bg-green-50 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="text-green-900 dark:text-green-100">
            Available Balance
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Saldo yang bisa ditarik kapan saja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-600 dark:text-green-400">
            {formatIDR(wallet?.balance_available || 0)}
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Form */}
      <WithdrawForm />

      {/* Locked Balance Info */}
      {totalLocked > 0 && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Locked Balance
            </CardTitle>
            <CardDescription>
              Saldo yang terkunci dan belum bisa ditarik
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Locked:</span>
              <span className="text-xl font-bold text-orange-600">
                {formatIDR(totalLocked)}
              </span>
            </div>
            {wallet?.unlock_date && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  Akan unlock dalam{" "}
                  <strong>
                    {daysUntilUnlock !== null
                      ? `${daysUntilUnlock} hari`
                      : "menunggu"}
                  </strong>{" "}
                  ({new Date(wallet.unlock_date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })})
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Setelah unlock, saldo akan otomatis masuk ke Available Balance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

