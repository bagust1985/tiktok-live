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
import { Copy, Check, Landmark } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getPublicBanks } from "@/lib/api";
import { cn } from "@/lib/utils";

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
        if (res.success) setBanks(res.data || []);
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Gagal memuat data bank",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const handleCopy = (account: string, id: number) => {
    navigator.clipboard.writeText(account);
    setCopiedId(id);
    toast({
      title: "Berhasil disalin",
      description: "Nomor rekening berhasil disalin",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="relative bg-black/40 backdrop-blur border border-cyan-400/20">
      {/* Neon glow */}
      <div className="absolute -top-20 -left-20 w-56 h-56 bg-cyan-500/10 blur-3xl rounded-full" />

      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 text-cyan-400">
          <Landmark className="h-5 w-5" />
          Rekening Tujuan Transfer
        </CardTitle>
        <CardDescription className="text-gray-400">
          Transfer sesuai jumlah deposit ke salah satu rekening di bawah ini
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        {/* LOADING */}
        {loading && (
          <div className="text-sm text-gray-400 animate-pulse">
            Memuat data bank...
          </div>
        )}

        {/* EMPTY */}
        {!loading && banks.length === 0 && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
            Belum ada rekening bank yang aktif. Silakan hubungi admin.
          </div>
        )}

        {/* BANK LIST */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banks.map((bank) => {
            const copied = copiedId === bank.id;

            return (
              <div
                key={bank.id}
                className={cn(
                  `
                  relative rounded-xl
                  border border-white/10
                  bg-black/50 backdrop-blur
                  p-4 space-y-3
                  transition-all
                  hover:border-cyan-400/50
                `,
                  copied &&
                    "border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.25)]"
                )}
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">
                    {bank.bank_name}
                  </p>

                  <p className="text-xl md:text-2xl font-mono font-bold tracking-wider text-cyan-400 break-all">
                    {bank.account_number}
                  </p>

                  <p className="text-xs text-gray-400">
                    a.n {bank.account_holder}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-cyan-400 hover:text-black"
                    onClick={() =>
                      handleCopy(bank.account_number, bank.id)
                    }
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1 text-green-500" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Salin
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* WARNING */}
        <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm text-yellow-300">
          ⚠️ Pastikan jumlah transfer sesuai dengan jumlah deposit yang dipilih.
          <br />
          Upload bukti transfer setelah proses selesai.
        </div>
      </CardContent>
    </Card>
  );
}
