"use client";

import { usePathname } from "next/navigation";
import AdminProtectedRoute from "@/components/admin/layout/AdminProtectedRoute";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminHeader from "@/components/admin/layout/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Check if current path is login page (any route starting with /admin/login)
  const isLoginPage = pathname?.startsWith("/admin/login");

  // Login page tidak perlu layout protected
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Other admin pages perlu protection
  return (
    <AdminProtectedRoute>
      <div className="min-h-screen">
        <AdminSidebar />
        <div className="ml-64">
          <AdminHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}

