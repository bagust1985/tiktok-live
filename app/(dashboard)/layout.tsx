"use client";

import { useEffect } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/authStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initFromStorage } = useAuthStore();

  useEffect(() => {
    // Initialize auth from localStorage on mount
    initFromStorage();
  }, [initFromStorage]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 md:ml-64 pt-16">
            <div className="container p-4 md:p-6">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

