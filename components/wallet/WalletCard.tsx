"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/format";
import { Wallet, Lock } from "lucide-react";

interface WalletCardProps {
  title: string;
  amount: number;
  description?: string;
  variant?: "available" | "locked";
  icon?: React.ReactNode;
}

export default function WalletCard({
  title,
  amount,
  description,
  variant = "available",
  icon,
}: WalletCardProps) {
  const defaultIcon =
    variant === "available" ? (
      <Wallet className="h-5 w-5" />
    ) : (
      <Lock className="h-5 w-5" />
    );

  return (
    <Card
      className={
        variant === "available"
          ? "border-green-500 bg-green-50 dark:bg-green-950"
          : "border-orange-500 bg-orange-50 dark:bg-orange-950"
      }
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon || defaultIcon}
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${
            variant === "available" ? "text-green-600" : "text-orange-600"
          }`}
        >
          {formatIDR(amount)}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

