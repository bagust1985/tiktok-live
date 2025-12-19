"use client";

import { useEffect, useState } from "react";
import { getNetworkStats } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  TrendingUp,
  Copy,
  Check,
  Share2,
} from "lucide-react";

export default function NetworkPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getNetworkStats().then((res) => {
      if (res.success) setStats(res.data);
    });
  }, []);

  const referralCode = user?.id || "N/A";

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({
      title: "Berhasil",
      description: "Kode referral berhasil disalin",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative space-y-8 px-4 py-6 md:px-6 lg:px-8">
      {/* NEON BACKGROUND */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-0 -right-0 w-72 h-72 bg-purple-500/20 blur-3xl rounded-full" />

      {/* HEADER */}
      <div className="relative z-10 space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Network
        </h1>
        <p className="text-sm md:text-base text-gray-400">
          Statistik jaringan dan bonus Anda
        </p>
      </div>

      {/* REFERRAL */}
      <Card className="relative z-10 bg-black/40 border border-cyan-500/30 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Share2 className="h-5 w-5" />
            Kode Referral
          </CardTitle>
          <CardDescription className="text-gray-400">
            Bagikan kode ini untuk mendapatkan bonus sponsor
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 p-4 rounded-lg bg-white/5 border border-white/10 font-mono text-lg font-bold text-white">
              {referralCode}
            </div>
            <Button
              onClick={handleCopyReferral}
              variant="outline"
              className="border-white/10"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-400" />
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
        </CardContent>
      </Card>

      {stats && (
        <>
          {/* NETWORK STATS */}
          <div className="grid gap-4 md:grid-cols-3 relative z-10">
            <StatCard
              title="Total Downlines"
              value={stats.totalDownlines}
              desc="Total anggota jaringan"
              color="cyan"
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              title="Left Count"
              value={stats.leftCount}
              desc="Kaki kiri binary"
              color="pink"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatCard
              title="Right Count"
              value={stats.rightCount}
              desc="Kaki kanan binary"
              color="purple"
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </div>

          {/* BONUS */}
          <div className="grid gap-4 md:grid-cols-2 relative z-10">
            <BonusCard
              title="Bonus Sponsor"
              desc="10% dari deposit downline"
              color="green"
              items={[
                ["Hari Ini", formatIDR(stats.sponsorBonusToday)],
                ["Bulan Ini", formatIDR(stats.sponsorBonusThisMonth)],
              ]}
            />

            <BonusCard
              title="Bonus Pairing" 
              desc="Bonus keseimbangan binary"
              color="blue"
              items={[
                ["Hari Ini", formatIDR(stats.pairingBonusToday)],
                ["Bulan Ini", formatIDR(stats.pairingBonusThisMonth)],
              ]}
            />

            <Card className="md:col-span-2 bg-black/40 border border-orange-500/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-orange-400">
                  Bonus Matching
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Sharing profit task downline (Locked 30 hari)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid md:grid-cols-3 gap-4">
                  <MatchingItem
                    label="Level 1 (30%)"
                    value={stats.matchingBonusByLevel.level1}
                  />
                  <MatchingItem
                    label="Level 2 (20%)"
                    value={stats.matchingBonusByLevel.level2}
                  />
                  <MatchingItem
                    label="Level 3 (10%)"
                    value={stats.matchingBonusByLevel.level3}
                  />
                </div>

                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="text-gray-400">
                    Total Hari Ini
                  </span>
                  <span className="font-bold text-green-400">
                    {formatIDR(stats.matchingBonusToday)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">
                    Total Bulan Ini
                  </span>
                  <span className="font-bold text-green-400">
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

/* ================= COMPONENT ================= */

function StatCard({
  title,
  value,
  desc,
  icon,
  color,
}: {
  title: string;
  value: number;
  desc: string;
  icon: React.ReactNode;
  color: "cyan" | "pink" | "purple";
}) {
  return (
    <Card
      className={`bg-black/40 border border-${color}-500/30 backdrop-blur-xl`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-sm text-${color}-400`}>
          {title}
        </CardTitle>
        <div className={`text-${color}-400`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">
          {value}
        </div>
        <p className="text-xs text-gray-400">{desc}</p>
      </CardContent>
    </Card>
  );
}

function BonusCard({
  title,
  desc,
  items,
  color,
}: {
  title: string;
  desc: string;
  items: [string, string][];
  color: "green" | "blue";
}) {
  return (
    <Card
      className={`bg-black/40 border border-${color}-500/30 backdrop-blur-xl`}
    >
      <CardHeader>
        <CardTitle className={`text-secondary `}>
          {title}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {desc}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-blue">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-gray-400">{label}</span>
            <span className={`font-bold text-${color}-400`}>
              {value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MatchingItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
      <div className="text-xs text-gray-400 mb-1">
        {label}
      </div>
      <div className="font-bold text-white">
        {formatIDR(value)}
      </div>
    </div>
  );
}
