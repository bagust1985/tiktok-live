"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";

export default function SuperAdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { admin, isSuperAdmin } = useAdminStore();

  useEffect(() => {
    if (admin && !isSuperAdmin()) {
      // Not a super admin, redirect to dashboard
      router.push("/admin/dashboard");
    }
  }, [admin, isSuperAdmin, router]);

  if (!admin || !isSuperAdmin()) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Access Denied - Super Admin Only</p>
      </div>
    );
  }

  return <>{children}</>;
}

