"use client";

import { create } from "zustand";
import type { User } from "@/types";

interface AdminState {
  admin: User | null;
  isAuthenticated: boolean;
  stats: any | null;
  setAdmin: (admin: User | null) => void;
  setStats: (stats: any) => void;
  logout: () => void;
  initFromStorage: () => void;
  isSuperAdmin: () => boolean;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  admin: null,
  isAuthenticated: false,
  stats: null,
  setAdmin: (admin) => {
    if (typeof window !== "undefined") {
      if (admin) {
        localStorage.setItem("admin-user", JSON.stringify(admin));
      } else {
        localStorage.removeItem("admin-user");
      }
    }
    set({ admin, isAuthenticated: !!admin });
  },
  setStats: (stats) => set({ stats }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin-user");
      localStorage.removeItem("admin-token"); // Changed: admin-token instead of auth-token
      // Don't remove auth-token or auth-user (those are for regular users)
    }
    set({ admin: null, isAuthenticated: false, stats: null });
  },
  initFromStorage: () => {
    if (typeof window === "undefined") return;
    
    try {
      // Check if there's an admin token first (separate from user token)
      const token = localStorage.getItem("admin-token"); // Changed: admin-token instead of auth-token
      if (!token) {
        // No admin token, clear admin data
        localStorage.removeItem("admin-user");
        set({ admin: null, isAuthenticated: false });
        return;
      }

      const stored = localStorage.getItem("admin-user");
      if (stored) {
        try {
          const admin = JSON.parse(stored);
          if (admin && admin.is_admin) {
            set({ admin, isAuthenticated: true });
            return;
          }
          // Not admin, clear
          localStorage.removeItem("admin-user");
          localStorage.removeItem("admin-token"); // Clear admin-token too
          set({ admin: null, isAuthenticated: false });
        } catch (e) {
          console.error("Error parsing admin-user:", e);
          localStorage.removeItem("admin-user");
          localStorage.removeItem("admin-token"); // Clear admin-token too
          set({ admin: null, isAuthenticated: false });
        }
      } else {
        // No admin-user stored, token exists but no user data
        // This shouldn't happen in normal flow, but clear token for safety
        localStorage.removeItem("admin-token");
        set({ admin: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error("Error in initFromStorage:", error);
      set({ admin: null, isAuthenticated: false });
    }
  },
  isSuperAdmin: () => {
    const { admin } = get();
    return admin?.is_admin === true && admin?.admin_role === "SUPER_ADMIN";
  },
}));

