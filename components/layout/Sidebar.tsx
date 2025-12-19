"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/Logo";

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Wallet", href: "/wallet", icon: Wallet },
  { title: "Deposit", href: "/deposit", icon: ArrowDownCircle },
  { title: "Withdraw", href: "/withdraw", icon: ArrowUpCircle },
  { title: "Network", href: "/network", icon: Users },
  { title: "Profile", href: "/profile", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* MOBILE TOGGLE */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button size="icon" variant="ghost" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {/* MOBILE SIDEBAR */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="
              fixed top-16 left-0
              h-[calc(100vh-4rem)] w-64
              bg-black
              border-r border-white/10
            "
          >
            <SidebarContent
              pathname={pathname}
              close={() => setOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside
        className="
          hidden md:flex
          fixed  left-0
          h-[calc(100vh)] w-64
          flex-col
          bg-black/80 backdrop-blur-xl
          border-r border-white/10
          z-40
        "
      >
        <SidebarContent pathname={pathname} />
      </aside>
    </>
  );
}

function SidebarContent({
  pathname,
  close,
}: {
  pathname: string;
  close?: () => void;
}) {
  return (
    <>
      {/* LOGO */}
      <div className="px-5 py-6 border-b border-white/10">
        <Link href="/dashboard" onClick={close}>
          <Logo className="w-40 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
        </Link>
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-1 p-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-gradient-to-r from-cyan-400/20 to-pink-500/20 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className={active ? "text-cyan-400" : "text-gray-400"} />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
