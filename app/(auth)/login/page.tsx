"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { login, resendOTP } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login: loginUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleResendOTP = async () => {
    if (!userEmail) {
      toast({
        title: "Error",
        description: "Silakan masukkan email Anda",
        variant: "destructive",
      });
      return;
    }

    setResending(true);
    try {
      const response = await resendOTP(userEmail);
      if (response.success) {
        toast({
          title: "OTP Terkirim",
          description: "Kode OTP baru telah dikirim ke email Anda. Silakan cek email dan verifikasi.",
        });
        // Redirect to verify-email page
        router.push(`/verify-email?email=${encodeURIComponent(userEmail)}`);
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal mengirim ulang OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengirim ulang OTP",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowVerificationMessage(false);

    try {
      const response = await login(formData);
      if (response.success && response.user) {
        loginUser(response.user);
        toast({
          title: "Login Berhasil",
          description: "Selamat datang kembali!",
        });
        router.push("/dashboard");
      } else {
        // Check if email verification is required
        if ((response as any).requiresVerification) {
          setShowVerificationMessage(true);
          // Try to extract email from username (if user entered email as username)
          setUserEmail(formData.username.includes("@") ? formData.username : "");
          toast({
            title: "Email Belum Terverifikasi",
            description: response.message || "Silakan verifikasi email terlebih dahulu",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Gagal",
            description: response.message || "Username atau password salah",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Masuk ke akun TiktokAsia Anda
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            {/* Email Verification Message */}
            {showVerificationMessage && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
                <p className="text-sm text-yellow-800">
                  Email Anda belum terverifikasi. Silakan verifikasi email terlebih dahulu untuk bisa login.
                </p>
                {!userEmail && (
                  <div className="space-y-2">
                    <Label htmlFor="email-verify" className="text-yellow-800">
                      Masukkan email Anda untuk mengirim ulang kode OTP:
                    </Label>
                    <Input
                      id="email-verify"
                      type="email"
                      placeholder="email@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOTP}
                    disabled={resending || !userEmail}
                    className="flex-1"
                  >
                    {resending ? "Mengirim..." : "Kirim Ulang OTP"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (userEmail) {
                        router.push(`/verify-email?email=${encodeURIComponent(userEmail)}`);
                      }
                    }}
                    disabled={!userEmail}
                    className="flex-1"
                  >
                    Halaman Verifikasi
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Login"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Belum punya akun?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

