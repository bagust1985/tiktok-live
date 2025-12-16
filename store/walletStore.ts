"use client";

import { create } from "zustand";
import type { Wallet, Transaction } from "@/types";

interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  setWallet: (wallet: Wallet) => void;
  updateBalance: (updates: Partial<Wallet>) => void;
  addTransaction: (transaction: Transaction) => void;
  setTransactions: (transactions: Transaction[]) => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  transactions: [],
  setWallet: (wallet) => set({ wallet }),
  updateBalance: (updates) => {
    const current = get().wallet;
    if (current) {
      set({
        wallet: {
          ...current,
          ...updates,
        },
      });
    }
  },
  addTransaction: (transaction) => {
    const current = get().transactions;
    set({
      transactions: [transaction, ...current],
    });
  },
  setTransactions: (transactions) => set({ transactions }),
}));

