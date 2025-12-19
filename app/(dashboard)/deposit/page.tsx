"use client";

import { useState } from "react";
import { MEMBERSHIP_TIERS } from "@/lib/constants";
import { formatIDR } from "@/lib/format";
import BankAccountDisplay from "@/components/deposit/BankAccountDisplay";
import DepositForm from "@/components/deposit/DepositForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DepositPage() {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  return (
    <div className="relative space-y-8 px-4 py-6 md:px-6 lg:px-8">
      {/* Neon background */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-0 -right-0 w-72 h-72 bg-pink-500/20 blur-3xl rounded-full" />

      {/* HEADER */}
      <div className="relative z-10 space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          Deposit
        </h1>
        <p className="text-sm text-muted-foreground">
          Pilih paket membership dan lakukan deposit untuk mulai mengerjakan task
        </p>
      </div>

      {/* MEMBERSHIP */}
      <div className="relative z-10">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Pilih Paket Membership
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MEMBERSHIP_TIERS.map((tier) => {
            const active = selectedTier === tier.level;

            return (
              <Card
                key={tier.level}
                onClick={() => setSelectedTier(tier.level)}
                className={cn(
                  `
                  cursor-pointer relative overflow-hidden
                  border border-white/10
                  bg-black/40 backdrop-blur
                  transition-all duration-300
                  hover:scale-[1.02] hover:border-cyan-400/50
                `,
                  active &&
                    `
                    border-cyan-400
                    shadow-[0_0_40px_rgba(34,211,238,0.25)]
                  `
                )}
              >
                {/* Glow */}
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-pink-500/10" />
                )}

                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      {tier.name}
                      {active && (
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                      )}
                    </CardTitle>
                    {active && (
                      <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                    )}
                  </div>
                  <CardDescription className="text-gray-400">
                    Paket {tier.name}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  <div className="text-2xl font-extrabold text-cyan-400">
                    {formatIDR(tier.deposit)}
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reward / Task</span>
                      <span className="font-medium">
                        {formatIDR(tier.rewardPerTask)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Task</span>
                      <span className="font-medium">
                        {tier.maxTasks} / hari
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Income Harian</span>
                      <span className="font-medium">
                        {formatIDR(tier.dailyIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                      <span className="text-gray-400">
                        Total (30 Hari)
                      </span>
                      <span className="font-bold text-pink-400">
                        {formatIDR(tier.totalIncome30Days)}
                      </span>
                    </div>
                  </div>

                  <Badge
                    className={cn(
                      "w-full justify-center py-4",
                      active
                        ? "bg-cyan-500 hover:bg-cyan-500"
                        : "bg-white/10 text-gray-300"
                    )}
                  >
                    {active ? "Dipilih" : "Pilih Paket"}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* BANK + FORM */}
      {selectedTier && (
        <div className="relative z-10 space-y-6">
          <BankAccountDisplay />
          <DepositForm selectedTier={selectedTier} />
        </div>
      )}

      {/* LOCK INFO */}
      <Card className="relative z-10 bg-black/40 backdrop-blur border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-cyan-400">
            Informasi Lock Period
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-300 space-y-2">
          <p>
            Deposit dan reward task akan dikunci selama{" "}
            <span className="font-bold text-white">30 hari</span>.
          </p>
          <p>
            Setelah 30 hari, saldo akan otomatis masuk ke{" "}
            <span className="font-semibold text-cyan-400">
              Available Balance
            </span>{" "}
            dan bisa ditarik kapan saja.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
