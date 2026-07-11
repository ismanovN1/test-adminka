"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PreferencesState {
  sidebarCollapsed: boolean;
  usersTableColumnVisibility: Record<string, boolean>;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setUsersTableColumnVisibility: (visibility: Record<string, boolean>) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      usersTableColumnVisibility: {},
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setUsersTableColumnVisibility: (usersTableColumnVisibility) =>
        set({ usersTableColumnVisibility }),
    }),
    {
      name: "nexa-preferences",
      version: 1,
      partialize: ({ sidebarCollapsed, usersTableColumnVisibility }) => ({
        sidebarCollapsed,
        usersTableColumnVisibility,
      }),
    },
  ),
);
