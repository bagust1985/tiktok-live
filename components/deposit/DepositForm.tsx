"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deposit } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MEMBERSHIP_TIERS } from "@/lib/constants";
import { formatIDR } from "@/lib/format";
import { Upload } from "lucide-react";

interface DepositFormProps {
  selectedTier: number | null;
  onSuccess?: () => void;
}

export default function DepositForm({ selectedTier, onSuccess }: DepositFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const tier = selectedTier
    ? MEMBERSHIP_TIERS.find((t) => t.level === selectedTier)
    : null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File terlalu besar. Maksimal 5MB",
          variant: "destructive",
        });
        return;
      }
      setProofImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTier || !tier) {
      toast({
        title: "Error",
        description: "Pilih tier membership terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!proofImage) {
      toast({
        title: "Error",
        description: "Upload bukti transfer terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    const depositAmount = amount ? parseFloat(amount.replace(/\./g, "")) : tier.deposit;

    if (depositAmount !== tier.deposit) {
      toast({
        title: "Error",
        description: `Jumlah transfer harus sesuai dengan tier (${formatIDR(tier.deposit)})`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await deposit({
        tier_level: tier.level,
        amount: depositAmount,
        proof_image: proofImage,
        notes: notes || undefined,
      });

      if (response.success) {
        toast({
          title: "Berhasil",
          description: "Deposit berhasil diajukan. Menunggu verifikasi admin.",
        });
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/wallet");
        }
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal mengajukan deposit",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengajukan deposit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTier || !tier) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Pilih tier membership terlebih dahulu
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Deposit</CardTitle>
        <CardDescription>
          Upload bukti transfer untuk tier {tier.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Jumlah Transfer</Label>
            <Input
              value={amount || formatIDR(tier.deposit).replace("Rp ", "").replace(/\./g, "")}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, "");
                setAmount(value);
              }}
              placeholder={tier.deposit.toString()}
              disabled
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Deposit untuk {tier.name}: {formatIDR(tier.deposit)}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Upload Bukti Transfer</Label>
            <div className="flex items-center gap-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
                {preview ? (
                  <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Klik untuk upload</span> bukti transfer
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, Max 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Catatan (Optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan jika diperlukan"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !proofImage}>
            {loading ? "Memproses..." : "Ajukan Deposit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

