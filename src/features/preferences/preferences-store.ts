"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PreferencesState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    }),
    {
      name: "nexa-preferences",
      version: 1,
      partialize: ({ sidebarCollapsed }) => ({ sidebarCollapsed }),
    },
  ),
);
