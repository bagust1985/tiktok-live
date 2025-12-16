"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getPublicBanks } from "@/lib/api";

interface CompanyBank {
  id: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  is_active: boolean;
}

export default function BankAccountDisplay() {
  const { toast } = useToast();
  const [banks, setBanks] = useState<CompanyBank[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicBanks()
      .then((res) => {
        if (res.success) {
          setBanks(res.data || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load banks", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (account: string, id: number) => {
    navigator.clipboard.writeText(account);
    setCopiedId(id);
    toast({
      title: "Berhasil",
      description: "Nomor rekening berhasil disalin",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <CardTitle>Rekening Tujuan Transfer</CardTitle>
        <CardDescription>
          Transfer sesuai jumlah deposit ke salah satu rekening di bawah ini
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat data bank...</p>
        ) : banks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada rekening bank yang aktif. Hubungi admin.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {banks.map((bank) => (
              <div
                key={bank.id}
                className="p-4 border rounded-lg bg-muted/50 flex flex-col justify-between gap-3"
              >
                <div>
                  <p className="font-semibold">{bank.bank_name}</p>
                  <p className="text-2xl font-mono font-bold mt-1 break-all">
                    {bank.account_number}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {bank.account_holder}
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(bank.account_number, bank.id)}
                  >
                    {copiedId === bank.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Pastikan jumlah transfer sesuai dengan jumlah deposit yang
            dipilih. Upload bukti transfer setelah transfer selesai.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

