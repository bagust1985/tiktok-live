"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { useAuthStore } from "@/store/authStore";
import { register } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    const step = searchParams.get("step");
    setShowAgreement(step !== "form");
  }, [searchParams]);

  const handleAgree = () => {
    router.push("/register?step=form");
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

    setLoading(true);

    try {
      const response = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        referral_code: formData.referral_code || undefined,
      });

      if (response.success && response.user) {
        loginUser(response.user);
        toast({
          title: "Registrasi Berhasil",
          description: "Selamat datang! Silakan deposit untuk mulai.",
        });
        router.push("/dashboard");
      } else {
        toast({
          title: "Registrasi Gagal",
          description: response.message || "Terjadi kesalahan saat registrasi",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat registrasi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showAgreement) {
    return <AgreementModal onAgree={handleAgree} onCancel={handleCancel} />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black overflow-hidden px-4">
      {/* Neon background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-white">
              Daftar
            </CardTitle>
            <CardDescription className="text-gray-400">
              Buat akun baru & mulai{" "}
              <span className="text-white">Task-to-Earn</span>
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {[
                { id: "username", label: "Username", type: "text", placeholder: "Masukkan username" },
                { id: "email", label: "Email", type: "email", placeholder: "Masukkan email" },
              ].map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="text-gray-300">
                    {field.label}
                  </Label>
                  <Input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={(formData as any)[field.id]}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.id]: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400"
                    required
                  />
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-pink-400 focus:ring-pink-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">
                  Konfirmasi Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-pink-400 focus:ring-pink-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral_code" className="text-gray-300">
                  Kode Referral (Opsional)
                </Label>
                <Input
                  id="referral_code"
                  type="text"
                  placeholder="Masukkan kode referral"
                  value={formData.referral_code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      referral_code: e.target.value,
                    })
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full font-semibold text-black
                  bg-gradient-to-r from-cyan-400 to-pink-500
                  hover:opacity-90 hover:scale-[1.02]
                  transition-all duration-200 shadow-lg"
              >
                {loading ? "Memproses..." : "Daftar"}
              </Button>

              <p className="text-sm text-center text-gray-400">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-white hover:underline">
                  Login
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
