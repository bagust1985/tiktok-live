"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deposit } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
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
import { MEMBERSHIP_TIERS } from "@/lib/constants";
import { formatIDR } from "@/lib/format";
import { Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DepositFormProps {
  selectedTier: number | null;
  onSuccess?: () => void;
}

export default function DepositForm({
  selectedTier,
  onSuccess,
}: DepositFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const tier = selectedTier
    ? MEMBERSHIP_TIERS.find((t) => t.level === selectedTier)
    : null;

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File terlalu besar",
        description: "Maksimal ukuran file 5MB",
        variant: "destructive",
      });
      return;
    }

    setProofImage(file);

    const reader = new FileReader();
    reader.onloadend = () =>
      setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tier || !proofImage) {
      toast({
        title: "Data belum lengkap",
        description: "Pilih tier dan upload bukti transfer",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await deposit({
        tier_level: tier.level,
        amount: tier.deposit,
        proof_image: proofImage,
        notes: notes || undefined,
      });

      if (res.success) {
        toast({
          title: "Deposit berhasil",
          description:
            "Menunggu verifikasi admin",
        });
        onSuccess ? onSuccess() : router.push("/wallet");
      } else {
        throw new Error(res.message);
      }
    } catch {
      toast({
        title: "Gagal",
        description: "Gagal mengajukan deposit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!tier) {
    return (
      <Card className="bg-black/40 border border-white/10">
        <CardContent className="py-6 text-center text-gray-400">
          Pilih tier membership terlebih dahulu
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative bg-black/40 border border-pink-500/20 backdrop-blur">
      {/* glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-500/10 blur-3xl rounded-full" />

      <CardHeader className="relative z-10">
        <CardTitle className="text-pink-400">
          Form Deposit
        </CardTitle>
        <CardDescription className="text-gray-400">
          Upload bukti transfer untuk tier{" "}
          <span className="text-white font-medium">
            {tier.name}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* AMOUNT */}
          <div className="space-y-1">
            <Label className="text-white">Jumlah Transfer</Label>
            <Input
              disabled
              value={formatIDR(tier.deposit)}
              className="font-mono text-lg bg-black/40 border-white/10 text-white  py-8 px-4"
            />
            <p className="text-xs text-gray-400">
              Transfer harus sesuai nominal di atas
            </p>
          </div>

          {/* UPLOAD */}
          <div className="space-y-2">
            <Label>Upload Bukti Transfer</Label>

            <label
              className={cn(
                `
                relative flex items-center justify-center
                w-full h-40 md:h-44
                rounded-xl border-2 border-dashed
                cursor-pointer transition
                bg-black/30
              `,
                preview
                  ? "border-pink-400/60"
                  : "border-white/20 hover:border-pink-400/40"
              )}
            >
              {preview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-contain rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl" />
                  <div className="relative z-10 text-white flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Ganti Gambar
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload className="h-8 w-8" />
                  <p className="text-sm font-medium">
                    Klik untuk upload
                  </p>
                  <p className="text-xs">
                    PNG / JPG • Max 5MB
                  </p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* NOTES */}
          <div className="space-y-1">
            <Label>Catatan (Opsional)</Label>
            <Input
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              placeholder="Tambahkan catatan jika perlu"
              className="bg-black/60 border-white/10 py-8 px-4"
            />
          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            disabled={loading || !proofImage}
            className="
              w-full h-11
              bg-gradient-to-r from-pink-500 to-cyan-400
              text-black font-semibold
              hover:opacity-90
            "
          >
            {loading ? "Memproses..." : "Ajukan Deposit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
