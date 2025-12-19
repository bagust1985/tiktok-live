"use client";

import { useEffect } from "react";
import { useWalletStore } from "@/store/walletStore";
import { getWalletBalance } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import WithdrawForm from "@/components/withdraw/WithdrawForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Clock, Wallet } from "lucide-react";

export default function WithdrawPage() {
  const { wallet, setWallet } = useWalletStore();

  useEffect(() => {
    getWalletBalance().then((res) => {
      if (res.success) setWallet(res.data);
    });
  }, [setWallet]);

  const totalLocked =
    (wallet?.balance_deposit || 0) +
    (wallet?.balance_reward_task || 0) +
    (wallet?.balance_matching_lock || 0);

  const daysUntilUnlock = wallet?.unlock_date
    ? Math.ceil(
        (new Date(wallet.unlock_date).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="relative space-y-8 px-4 py-6 md:px-6 lg:px-8">
      {/* Neon background */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-0 -right-0 w-72 h-72 bg-green-500/20 blur-3xl rounded-full" />

      {/* HEADER */}
      <div className="relative z-10 space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Withdraw
        </h1>
        <p className="text-sm md:text-base text-gray-400">
          Tarik saldo ke rekening bank Anda
        </p>
      </div>

      {/* AVAILABLE BALANCE */}
      <Card className="relative z-10 bg-black/40 border border-green-500/30 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Wallet className="h-5 w-5" />
            Available Balance
          </CardTitle>
          <CardDescription className="text-gray-400">
            Saldo yang bisa ditarik kapan saja
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl md:text-4xl font-bold text-green-400 drop-shadow">
            {formatIDR(wallet?.balance_available || 0)}
          </div>
        </CardContent>
      </Card>

      {/* WITHDRAW FORM */}
      <div className="relative z-10">
        <WithdrawForm />
      </div>

      {/* LOCKED BALANCE INFO */}
      {totalLocked > 0 && (
        <Card className="relative z-10 bg-black/40 border border-orange-500/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-400">
              <Lock className="h-5 w-5" />
              Locked Balance
            </CardTitle>
            <CardDescription className="text-gray-400">
              Saldo terkunci dan belum bisa ditarik
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">
                Total Locked
              </span>
              <span className="text-lg font-bold text-orange-400">
                {formatIDR(totalLocked)}
              </span>
            </div>

            {wallet?.unlock_date && (
              <div className="flex items-start gap-2 text-gray-300">
                <Clock className="h-4 w-4 mt-0.5 text-orange-400" />
                <span>
                  Akan unlock dalam{" "}
                  <strong className="text-white">
                    {daysUntilUnlock !== null
                      ? `${daysUntilUnlock} hari`
                      : "menunggu"}
                  </strong>
                  <br />
                  <span className="text-xs text-gray-400">
                    {new Date(wallet.unlock_date).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </span>
              </div>
            )}

            <p className="text-xs text-gray-400 border-t border-white/10 pt-3">
              Setelah unlock, saldo akan otomatis masuk ke
              <span className="text-green-400 font-medium">
                {" "}
                Available Balance
              </span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
