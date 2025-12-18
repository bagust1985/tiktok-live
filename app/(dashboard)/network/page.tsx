"use client";

import { useEffect } from "react";
import { useWalletStore } from "@/store/walletStore";
import { getNetworkStats } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/use-toast";

export default function NetworkPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getNetworkStats().then((response: any) => {
      if (response.success) {
        setStats(response.data);
      }
    });
  }, []);

  const referralCode = user?.is_active ? user.id : null;
  const shareLink = user?.is_active ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${user.id}` : null;
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyReferral = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({
      title: "Berhasil",
      description: "Kode referral berhasil disalin",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyShareLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    toast({
      title: "Berhasil",
      description: "Link referral berhasil disalin",
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Network</h1>
        <p className="text-muted-foreground">
          Lihat statistik jaringan dan bonus Anda
        </p>
      </div>

      {/* Referral Code */}
      <Card>
        <CardHeader>
          <CardTitle>Kode Referral</CardTitle>
          <CardDescription>
            {user?.is_active
              ? "Bagikan kode ini untuk mendapatkan bonus sponsor"
              : "Lakukan deposit untuk mengaktifkan akun dan mendapatkan kode referral"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user?.is_active ? (
            <div className="flex items-center gap-4">
              <div className="flex-1 p-4 border rounded-lg bg-muted font-mono text-lg font-bold">
                {referralCode}
              </div>
              <Button onClick={handleCopyReferral} variant="outline">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Disalin
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Salin
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-muted text-center">
              <p className="text-muted-foreground">
                Akun Anda belum aktif. Silakan lakukan deposit terlebih dahulu untuk mendapatkan kode referral.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Link */}
      {user?.is_active && shareLink && (
        <Card>
          <CardHeader>
            <CardTitle>Share Link</CardTitle>
            <CardDescription>
              Bagikan link ini untuk registrasi dengan kode referral Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 p-4 border rounded-lg bg-muted text-sm break-all">
                {shareLink}
              </div>
              <Button onClick={handleCopyShareLink} variant="outline">
                {copiedLink ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Disalin
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Salin Link
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Stats */}
      {stats && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Downlines
                </CardTitle>
                <Users className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDownlines}</div>
                <p className="text-xs text-muted-foreground">
                  Total anggota jaringan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Left Count</CardTitle>
                <TrendingUp className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.leftCount}</div>
                <p className="text-xs text-muted-foreground">Kaki kiri binary</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Right Count</CardTitle>
                <TrendingUp className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rightCount}</div>
                <p className="text-xs text-muted-foreground">Kaki kanan binary</p>
              </CardContent>
            </Card>
          </div>

          {/* Bonus Summary */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bonus Sponsor</CardTitle>
                <CardDescription>10% dari deposit downline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Hari Ini:</span>
                  <span className="font-medium">
                    {formatIDR(stats.sponsorBonusToday)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bulan Ini:</span>
                  <span className="font-medium">
                    {formatIDR(stats.sponsorBonusThisMonth)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bonus Pairing</CardTitle>
                <CardDescription>Bonus keseimbangan binary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Hari Ini:</span>
                  <span className="font-medium">
                    {formatIDR(stats.pairingBonusToday)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bulan Ini:</span>
                  <span className="font-medium">
                    {formatIDR(stats.pairingBonusThisMonth)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Bonus Matching</CardTitle>
                <CardDescription>
                  Sharing profit dari hasil task downline (Locked 30 hari)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Level 1 (30%)
                    </div>
                    <div className="font-medium">
                      {formatIDR(stats.matchingBonusByLevel.level1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Level 2 (20%)
                    </div>
                    <div className="font-medium">
                      {formatIDR(stats.matchingBonusByLevel.level2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Level 3 (10%)
                    </div>
                    <div className="font-medium">
                      {formatIDR(stats.matchingBonusByLevel.level3)}
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-medium">Total Hari Ini:</span>
                  <span className="font-bold">
                    {formatIDR(stats.matchingBonusToday)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Bulan Ini:</span>
                  <span className="font-bold">
                    {formatIDR(stats.matchingBonusThisMonth)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

