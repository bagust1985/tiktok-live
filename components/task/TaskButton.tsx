"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore } from "@/store/taskStore";
import { useWalletStore } from "@/store/walletStore";
import { claimTask, getWalletBalance } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface TaskButtonProps {
  taskNumber: number;
  currentCount: number;
  maxCount: number;
  canClaim: boolean;
  hasEnoughBalance?: boolean;
  nextClaimAvailable?: Date;
  taskConfig?: {
    id: number;
    sequence: number;
    title: string;
    description?: string;
    target_url: string;
    icon_url?: string;
    is_active: boolean;
  };
}

export default function TaskButton({
  taskNumber,
  currentCount,
  maxCount,
  canClaim,
  hasEnoughBalance = true,
  nextClaimAvailable,
  taskConfig,
}: TaskButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { incrementCounter, setLastClaimTime } = useTaskStore();
  const { wallet, setWallet } = useWalletStore();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [completed, setCompleted] = useState(taskNumber <= currentCount);

  useEffect(() => {
    setCompleted(taskNumber <= currentCount);
  }, [taskNumber, currentCount]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleStartTask = async () => {
    if (!canClaim || currentCount >= maxCount || completed || !hasEnoughBalance) return;

    // 1. Open app via deep link or URL from task config in new tab
    try {
      const targetUrl = taskConfig?.target_url || `tllapp://view/task/${taskNumber}`;
      const newWindow = window.open(targetUrl, '_blank');
      if (!newWindow) {
        // Popup blocked, show warning
        toast({
          title: "Peringatan",
          description: "Popup diblokir. Izinkan popup untuk membuka task link.",
          variant: "destructive",
        });
        // Fallback: try to open in current tab if popup is blocked
        try {
          window.location.href = targetUrl;
        } catch (fallbackError) {
          console.error("Failed to open link:", fallbackError);
        }
      }
    } catch (error) {
      console.error("Failed to open deep link:", error);
      toast({
        title: "Peringatan",
        description: "Pastikan aplikasi Tiktok Live&Like sudah terinstall",
      });
    }

    // 2. Start timer (15 seconds)
    setLoading(true);
    setCountdown(15);

    // 3. After 15 seconds, claim the task
    setTimeout(async () => {
      try {
        const response: any = await claimTask();

        if (response.success) {
          incrementCounter();
          setLastClaimTime(new Date());
          setCompleted(true);

          // Refresh wallet balance
          const walletResponse: any = await getWalletBalance();
          if (walletResponse.success) {
            setWallet(walletResponse.data);
          }

          toast({
            title: "Task Selesai!",
            description: `Anda mendapatkan reward ${response.data.reward ? `Rp ${response.data.reward.toLocaleString('id-ID')}` : ''}`,
          });

          // Auto reload setelah 1.5 detik untuk update progress dan wallet
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          toast({
            title: "Gagal",
            description: response.message || "Gagal mengklaim task",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Error claiming task:", error);
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat mengklaim task",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setCountdown(0);
      }
    }, 15000);
  };

  const isDisabled = loading || currentCount >= maxCount || completed || !canClaim || !hasEnoughBalance;

  // Get icon URL (handle both relative and absolute paths)
  const getIconUrl = () => {
    if (!taskConfig?.icon_url) return null;
    
    if (taskConfig.icon_url.startsWith('http')) {
      return taskConfig.icon_url;
    }
    
    // Relative path from backend
    return `${process.env.NEXT_PUBLIC_API_URL}${taskConfig.icon_url}`;
  };

  const iconUrl = getIconUrl();

  return (
    <div className="relative">
      <Button
        onClick={handleStartTask}
        disabled={isDisabled}
        title={!hasEnoughBalance ? "Deposit tidak mencukupi untuk tier Anda" : undefined}
        className={`w-full h-24 relative ${
          completed
            ? "bg-green-500 hover:bg-green-600"
            : loading
            ? "bg-gray-500 cursor-wait"
            : !hasEnoughBalance
            ? "bg-gray-400 cursor-not-allowed opacity-50"
            : "bg-primary hover:bg-primary/90"
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Clock className="h-6 w-6 animate-spin" />
            <span className="text-sm">
              Verifikasi Task... {countdown}s
            </span>
          </div>
        ) : completed ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="h-6 w-6" />
            <span className="text-sm">Selesai</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {iconUrl ? (
              <div className="relative w-10 h-10">
                <Image
                  src={iconUrl}
                  alt={taskConfig?.title || `Task ${taskNumber}`}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    // Hide image and show Play icon on error
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <Play className="h-6 w-6" />
            )}
            <span className="text-sm">{taskConfig?.title || `Task ${taskNumber}`}</span>
          </div>
        )}
      </Button>
      {taskNumber <= currentCount && (
        <Badge
          className="absolute -top-2 -right-2"
          variant="success"
        >
          ✓
        </Badge>
      )}
    </div>
  );
}

