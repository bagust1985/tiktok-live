"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { getUserProfile, updateProfile, changePassword, uploadAvatar, updatePin } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { User, Lock, Camera, Loader2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pinData, setPinData] = useState({
    pin: "",
    confirmPin: "",
  });

  const loadProfile = useCallback(async () => {
    try {
      const response: any = await getUserProfile();
      if (response.success && response.data) {
        setUser(response.data);
        setProfileData({
          full_name: response.data.full_name || "",
          phone: response.data.phone || "",
        });
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  }, [setUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "File harus berupa gambar",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Ukuran file maksimal 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const response: any = await uploadAvatar(file);
      if (response.success) {
        toast({
          title: "Berhasil",
          description: "Foto profil berhasil diupdate",
        });
        // Update user in store
        await loadProfile();
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal upload foto",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat upload foto",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const response: any = await updateProfile(profileData);
      if (response.success) {
        toast({
          title: "Berhasil",
          description: "Profile berhasil diupdate",
        });
        setUser(response.data);
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Password baru dan konfirmasi password tidak sama",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password baru minimal 6 karakter",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response: any = await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.success) {
        toast({
          title: "Berhasil",
          description: "Password berhasil diubah",
        });
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal mengubah password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePin = async () => {
    if (!pinData.pin || pinData.pin.length !== 6 || !/^\d{6}$/.test(pinData.pin)) {
      toast({
        title: "Error",
        description: "PIN harus berupa 6 digit angka",
        variant: "destructive",
      });
      return;
    }

    if (pinData.pin !== pinData.confirmPin) {
      toast({
        title: "Error",
        description: "PIN dan konfirmasi PIN tidak sama",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response: any = await updatePin(pinData);
      if (response.success) {
        toast({
          title: "Berhasil",
          description: "PIN berhasil diupdate",
        });
        setPinData({
          pin: "",
          confirmPin: "",
        });
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal mengupdate PIN",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const avatarUrl = user?.avatar_url 
    ? `${API_BASE_URL}${user.avatar_url}`
    : null;

  return (
    <div className="relative space-y-8 px-4 py-6 md:px-6 lg:px-8">
      {/* NEON BACKGROUND */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-0 -right-0 w-72 h-72 bg-purple-500/20 blur-3xl rounded-full" />
      <div>
        <h1 className="text-3xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground">
          Kelola informasi profil dan pengaturan keamanan akun Anda
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
      <TabsList className="bg-muted/60 p-1 rounded-xl text-secondary">
          <TabsTrigger
            value="profile"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow"
          >
            <User className="mr-2 h-4 w-4" />
            Data Diri
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow"
          >
            <Lock className="mr-2 h-4 w-4" />
            Keamanan
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="bg-white/5 border border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-gray-300">Data Diri</CardTitle>
              <CardDescription>
                Update informasi profil Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div
                    onClick={handleAvatarClick}
                    className="relative w-32 h-32 rounded-full bg-muted cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center overflow-hidden border-4 border-background shadow-lg"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-muted-foreground" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Klik foto untuk mengubah avatar
                </p>
              </div>

              {/* Username (Read-only) */}
              <div className="space-y-2">
                <Label className="text-secondary">Username</Label>
                <Input value={user?.username || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  Username tidak bisa diubah
                </p>
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label className="text-secondary">Email</Label>
                <Input value={user?.email || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  Email tidak bisa diubah
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label className="text-secondary" htmlFor="full_name">Nama Lengkap</Label>
                <Input
                  id="full_name"
                  className="bg-white/5 border border-white/10"
                  value={profileData.full_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, full_name: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label className="text-secondary" htmlFor="phone">No. Handphone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  className="bg-white/5 border border-white/10"
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  placeholder="Masukkan nomor handphone"
                />
              </div>

              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            {/* Change Password */}
            <Card className="bg-white/5 border border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-gray-300">Ganti Password</CardTitle>
                <CardDescription>
                  Ubah password untuk meningkatkan keamanan akun Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-secondary" htmlFor="oldPassword">Password Lama</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    className="bg-white/5 border border-white/10"
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, oldPassword: e.target.value })
                    }
                    placeholder="Masukkan password lama"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary" htmlFor="newPassword">Password Baru</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="bg-white/5 border border-white/10"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    placeholder="Masukkan password baru (minimal 6 karakter)"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary" htmlFor="confirmPassword">Ulangi Password Baru</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="bg-white/5 border border-white/10"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    placeholder="Ulangi password baru"
                  />
                </div>
                <Button onClick={handleChangePassword} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Password"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* PIN Withdraw */}
            <Card className="bg-white/5 border border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-gray-300">PIN Withdraw</CardTitle>
                <CardDescription>
                  Atur PIN 6 digit untuk keamanan saat melakukan withdraw
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-secondary" htmlFor="pin">PIN (6 Digit)</Label>
                  <Input
                    id="pin"
                    type="password"
                    className="bg-white/5 border border-white/10"
                    maxLength={6}
                    value={pinData.pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setPinData({ ...pinData, pin: value });
                    }}
                    placeholder="Masukkan PIN 6 digit"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-secondary" htmlFor="confirmPin">Ulangi PIN</Label>
                  <Input
                    id="confirmPin"
                    className="bg-white/5 border border-white/10"
                    type="password"
                    maxLength={6}
                    value={pinData.confirmPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setPinData({ ...pinData, confirmPin: value });
                    }}
                    placeholder="Ulangi PIN 6 digit"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  PIN digunakan untuk verifikasi saat melakukan withdraw
                </p>
                <Button onClick={handleUpdatePin} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan PIN"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

