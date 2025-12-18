"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { register } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import AgreementModal from "@/components/auth/AgreementModal";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { login: loginUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    referral_code: "",
  });

  useEffect(() => {
    // Check if user already agreed (step=form in URL)
    const step = searchParams.get("step");
    if (step === "form") {
      setShowAgreement(false);
    } else {
      setShowAgreement(true);
    }

    // Auto-fill referral code from query parameter
    const refCode = searchParams.get("ref");
    if (refCode) {
      setFormData((prev) => ({
        ...prev,
        referral_code: refCode,
      }));
    }
  }, [searchParams]);

  const handleAgree = () => {
    // Redirect to register form, preserve ref parameter if exists
    const refCode = searchParams.get("ref");
    const redirectUrl = refCode ? `/register?step=form&ref=${refCode}` : "/register?step=form";
    router.push(redirectUrl);
    setShowAgreement(false);
  };

  const handleCancel = () => {
    router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Password dan konfirmasi password tidak sama",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password minimal 6 karakter",
        variant: "destructive",
      });
      return;
    }

    if (!formData.referral_code || formData.referral_code.trim() === "") {
      toast({
        title: "Error",
        description: "Kode referral wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        referral_code: formData.referral_code,
      });

      if (response.success && response.user) {
        toast({
          title: "Registrasi Berhasil",
          description: response.message || "Silakan cek email Anda untuk kode OTP verifikasi",
        });
        // Redirect to verify-email page with email
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast({
          title: "Registrasi Gagal",
          description: response.message || "Terjadi kesalahan saat registrasi",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat registrasi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show agreement modal if not yet agreed
  if (showAgreement) {
    return <AgreementModal onAgree={handleAgree} onCancel={handleCancel} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Daftar</CardTitle>
          <CardDescription>
            Buat akun baru untuk mulai mendapatkan penghasilan
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ulangi password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referral_code">Kode Referral</Label>
              <Input
                id="referral_code"
                type="text"
                placeholder="Masukkan kode referral"
                value={formData.referral_code}
                onChange={(e) =>
                  setFormData({ ...formData, referral_code: e.target.value })
                }
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Daftar"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

