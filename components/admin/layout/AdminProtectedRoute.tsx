"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";

export default function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, admin, initFromStorage } = useAdminStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    initFromStorage();
    // Small delay to ensure storage is checked
    const timer = setTimeout(() => {
      setChecking(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [initFromStorage]);

  useEffect(() => {
    if (!checking && (!isAuthenticated || !admin?.is_admin)) {
      router.push("/admin/login");
    }
  }, [checking, isAuthenticated, admin, router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !admin?.is_admin) {
    return null;
  }

  return <>{children}</>;
}

