"use client";

import { useAdminStore } from "@/store/adminStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminHeader() {
  const { admin } = useAdminStore();

  const initials = admin?.username
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "A";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 ml-64">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Admin Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{admin?.username}</p>
            <p className="text-xs text-muted-foreground">{admin?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

