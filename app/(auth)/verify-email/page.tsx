"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { verifyEmail, resendOTP } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { login: loginUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam) {
      toast({
        title: "Error",
        description: "Email tidak ditemukan",
        variant: "destructive",
      });
      router.push("/register");
      return;
    }
    setEmail(emailParam);
  }, [searchParams, router, toast]);

  useEffect(() => {
    // Auto-focus first input
    const firstInput = document.getElementById("otp-0");
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  useEffect(() => {
    // Countdown timer for resend
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single character
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d*$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setOtp(newOtp);

    // Focus last input or submit if complete
    if (pastedData.length === 6) {
      const lastInput = document.getElementById("otp-5");
      if (lastInput) {
        lastInput.focus();
      }
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast({
        title: "Error",
        description: "Masukkan 6 digit kode OTP",
        variant: "destructive",
      });
      return;
    }

    if (!email) {
      toast({
        title: "Error",
        description: "Email tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await verifyEmail(email, otpCode);
      if (response.success && response.user) {
        loginUser(response.user);
        toast({
          title: "Verifikasi Berhasil",
          description: "Email Anda telah terverifikasi. Selamat datang!",
        });
        router.push("/dashboard");
      } else {
        toast({
          title: "Verifikasi Gagal",
          description: response.message || "Kode OTP tidak valid",
          variant: "destructive",
        });
        // Reset OTP on error
        setOtp(["", "", "", "", "", ""]);
        const firstInput = document.getElementById("otp-0");
        if (firstInput) {
          firstInput.focus();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat verifikasi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    if (!email) return;

    setResending(true);
    try {
      const response = await resendOTP(email);
      if (response.success) {
        toast({
          title: "OTP Terkirim",
          description: "Kode OTP baru telah dikirim ke email Anda",
        });
        setResendCooldown(60); // 60 seconds cooldown
        // Reset OTP inputs
        setOtp(["", "", "", "", "", ""]);
        const firstInput = document.getElementById("otp-0");
        if (firstInput) {
          firstInput.focus();
        }
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

  const otpCode = otp.join("");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Verifikasi Email</CardTitle>
          <CardDescription>
            Masukkan kode OTP yang telah dikirim ke email Anda
          </CardDescription>
          {email && (
            <p className="text-sm text-muted-foreground mt-2">
              Email: <span className="font-medium">{email}</span>
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OTP Input */}
          <div className="space-y-2">
            <Label>Kode OTP (6 digit)</Label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold"
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={loading || otpCode.length !== 6}
            className="w-full"
          >
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </Button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Tidak menerima kode OTP?
            </p>
            <Button
              variant="link"
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
              className="text-primary"
            >
              {resending
                ? "Mengirim..."
                : resendCooldown > 0
                ? `Kirim ulang (${resendCooldown}s)`
                : "Kirim ulang kode OTP"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-center text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Daftar
            </Link>
          </p>
          <p className="text-sm text-center text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

