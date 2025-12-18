"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { login } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setAdmin, isAuthenticated, initFromStorage } = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    initFromStorage();
  }, []); // Only run once on mount

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(formData);
      if (response.success && response.user) {
        // Check if user is admin
        if (response.user.is_admin) {
          // Store admin token separately (admin-token instead of auth-token)
          // This prevents user logout from affecting admin session
          if (response.token && typeof window !== 'undefined') {
            localStorage.setItem('admin-token', response.token);
            // Also set as cookie for middleware access (7 days expiry)
            document.cookie = `admin-token=${response.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
            // Remove auth-token that was set by login() function
            localStorage.removeItem('auth-token');
            // Don't store in auth-user, only admin-user
            localStorage.removeItem('auth-user');
          }
          setAdmin(response.user);
          toast({
            title: "Login Berhasil",
            description: "Selamat datang di Admin Panel!",
          });
          router.push("/admin/dashboard");
        } else {
          // Clear token if not admin
          if (typeof window !== 'undefined') {
            localStorage.removeItem("auth-token");
            localStorage.removeItem("auth-user");
          }
          toast({
            title: "Akses Ditolak",
            description: "Anda bukan admin. Hanya admin yang bisa akses.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login Gagal",
          description: response.message || "Username atau password salah",
          variant: "destructive",
        });
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
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Masuk ke Admin Panel Tiktok Live&Like
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
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

