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
      localStorage.removeItem("auth-token");
    }
    set({ admin: null, isAuthenticated: false, stats: null });
  },
  initFromStorage: () => {
    if (typeof window === "undefined") return;
    
    try {
      // Check if there's a token first
      const token = localStorage.getItem("auth-token");
      if (!token) {
        // No token, clear admin
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
          set({ admin: null, isAuthenticated: false });
        } catch (e) {
          console.error("Error parsing admin-user:", e);
          localStorage.removeItem("admin-user");
          set({ admin: null, isAuthenticated: false });
        }
      } else {
        // No admin-user stored, check auth-user (in case user just logged in)
        const authUser = localStorage.getItem("auth-user");
        if (authUser) {
          try {
            const user = JSON.parse(authUser);
            if (user && user.is_admin) {
              // This is admin, sync to admin store
              set({ admin: user, isAuthenticated: true });
              localStorage.setItem("admin-user", authUser);
            }
          } catch (e) {
            // Invalid, ignore
            console.error("Error parsing auth-user:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error in initFromStorage:", error);
      set({ admin: null, isAuthenticated: false });
    }
  },
}));

