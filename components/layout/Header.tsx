"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useWalletStore } from "@/store/walletStore";
import { formatIDR } from "@/lib/format";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { LogOut, User, Wallet } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { wallet } = useWalletStore();

  const initials =
    user?.username
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="
          fixed top-0 right-0 z-40
          h-20
          w-full md:w-[calc(100%-16rem)]
          md:ml-64
          bg-black/70 backdrop-blur-xl
          border-b border-white/10
          flex items-center justify-end
          px-4 md:px-6
        "
      >
        <div className="flex items-center gap-4">
          {/* DESKTOP — WALLET */}
          {wallet && (
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
              <Wallet className="h-4 w-4 text-cyan-400" />
              <span>
                Available{" "}
                <span className="text-white font-semibold">
                  {formatIDR(wallet.balance_available)}
                </span>
              </span>
            </div>
          )}

          {/* AVATAR */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="
                  relative h-10 w-10 rounded-full
                  hover:bg-white/10
                  after:absolute after:inset-0 after:rounded-full
                  after:shadow-[0_0_25px_rgba(34,211,238,0.6)]
                "
              >
                {/* Online indicator */}
                <span
                  className="
                    absolute -top-0.5 -right-0.5
                    h-3 w-3 rounded-full
                    bg-green-400 animate-pulse
                  "
                />

                <Avatar className="bg-gradient-to-br from-cyan-400 to-pink-500">
                  <AvatarFallback className="text-black font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="
                w-64 bg-black/90
                border border-white/10
                backdrop-blur-xl
                text-gray-300
              "
            >
              {/* USER INFO */}
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-white">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>

              {/* MOBILE — WALLET */}
              {wallet && (
                <>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <div
                    onClick={() => router.push("/wallet")}
                    className="
                      md:hidden
                      mx-2 my-1
                      flex items-center gap-3
                      rounded-lg
                      px-3 py-2
                      cursor-pointer
                      bg-gradient-to-r from-cyan-400/10 to-pink-500/10
                      hover:from-cyan-400/20 hover:to-pink-500/20
                    "
                  >
                    <Wallet className="h-4 w-4 text-cyan-400" />
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400">
                        Available Balance
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {formatIDR(wallet.balance_available)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="hover:bg-white/10 cursor-pointer"
              >
                <User className="mr-2 h-4 w-4 text-cyan-400" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="hover:bg-red-500/10 cursor-pointer text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Neon scanline */}
        <div
          className="
            absolute bottom-0 left-0 right-0 h-[1px]
            bg-gradient-to-r from-transparent via-cyan-400 to-transparent
          "
        />
      </motion.header>

      {/* Spacer */}
      <div className="h-16 md:ml-64" />
    </>
  );
}
