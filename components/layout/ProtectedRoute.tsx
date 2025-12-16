"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, initFromStorage } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage first
    initFromStorage();
    // Small delay to ensure storage is checked
    const timer = setTimeout(() => {
      setChecking(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [initFromStorage]);

  useEffect(() => {
    if (!checking && !isAuthenticated) {
      router.push("/login");
    }
  }, [checking, isAuthenticated, router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

