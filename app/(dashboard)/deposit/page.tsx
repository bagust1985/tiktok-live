"use client";

import { useState } from "react";
import { MEMBERSHIP_TIERS } from "@/lib/constants";
import { formatIDR } from "@/lib/format";
import BankAccountDisplay from "@/components/deposit/BankAccountDisplay";
import DepositForm from "@/components/deposit/DepositForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function DepositPage() {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deposit</h1>
        <p className="text-muted-foreground">
          Pilih paket membership dan lakukan deposit untuk mulai mengerjakan task
        </p>
      </div>

      {/* Membership Tier Selection */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pilih Paket Membership</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {MEMBERSHIP_TIERS.map((tier) => (
            <Card
              key={tier.level}
              className={`cursor-pointer transition-all hover:border-primary ${
                selectedTier === tier.level ? "border-primary border-2" : ""
              }`}
              onClick={() => setSelectedTier(tier.level)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{tier.name}</CardTitle>
                  {selectedTier === tier.level && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
                <CardDescription>Paket {tier.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold text-primary">
                  {formatIDR(tier.deposit)}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reward/Task:</span>
                    <span className="font-medium">{formatIDR(tier.rewardPerTask)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Task:</span>
                    <span className="font-medium">{tier.maxTasks}/hari</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Income Harian:</span>
                    <span className="font-medium">{formatIDR(tier.dailyIncome)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-muted-foreground">Total (30 Hari):</span>
                    <span className="font-bold text-primary">
                      {formatIDR(tier.totalIncome30Days)}
                    </span>
                  </div>
                </div>
                <Badge variant={selectedTier === tier.level ? "default" : "outline"}>
                  {selectedTier === tier.level ? "Dipilih" : "Pilih"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bank Account Display */}
      {selectedTier && (
        <>
          <BankAccountDisplay />
          <DepositForm selectedTier={selectedTier} />
        </>
      )}

      {/* Info about Lock Period */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            Informasi Lock Period
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 dark:text-blue-200">
          <p className="mb-2">
            Deposit dan reward dari task akan dikunci selama <strong>30 hari</strong>.
          </p>
          <p>
            Setelah 30 hari, saldo akan otomatis masuk ke Available Balance dan bisa ditarik kapan saja.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

