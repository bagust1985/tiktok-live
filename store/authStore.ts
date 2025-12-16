"use client";

import { create } from "zustand";
import type { User } from "@/types";
import { removeAuthToken } from "@/lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth-user", JSON.stringify(user));
    }
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-user");
      removeAuthToken();
    }
    set({ user: null, isAuthenticated: false });
  },
  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("auth-user", JSON.stringify(user));
      } else {
        localStorage.removeItem("auth-user");
      }
    }
    set({ user, isAuthenticated: !!user });
  },
  initFromStorage: () => {
    if (typeof window === "undefined") return;
    
    try {
      // Check if token exists
      const token = localStorage.getItem("auth-token");
      const stored = localStorage.getItem("auth-user");
      
      // If no token, clear user data (inconsistent state)
      if (!token) {
        if (stored) {
          localStorage.removeItem("auth-user");
        }
        set({ user: null, isAuthenticated: false });
        return;
      }
      
      // If token exists but no user data, keep unauthenticated
      if (!stored) {
        set({ user: null, isAuthenticated: false });
        return;
      }
      
      // Both token and user data exist, restore state
      try {
        const user = JSON.parse(stored);
        if (user && user.id) {
          set({ user, isAuthenticated: true });
        } else {
          // Invalid user data, clear it
          localStorage.removeItem("auth-user");
          localStorage.removeItem("auth-token");
          set({ user: null, isAuthenticated: false });
        }
      } catch (e) {
        // Invalid JSON, clear it
        console.error("Error parsing auth-user:", e);
        localStorage.removeItem("auth-user");
        localStorage.removeItem("auth-token");
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error("Error in initFromStorage:", error);
      set({ user: null, isAuthenticated: false });
    }
  },
}));
