"use client";

import { useEffect } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAuthStore } from "@/store/authStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initFromStorage } = useAuthStore();

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
        <div className="flex min-h-screen">
          {/* LEFT — SIDEBAR */}
          <Sidebar />

          {/* RIGHT — HEADER + CONTENT */}
          <div className="flex flex-col flex-1">
            {/* HEADER */}
            <Header />

            {/* CONTENT */}
            <main className="flex-1 md:ml-64">
              <div
                className="
                  mx-auto max-w-7xl
                 
                "
              >
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
