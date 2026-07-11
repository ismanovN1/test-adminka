"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PreferencesState {
  sidebarCollapsed: boolean;
  usersTableColumnVisibility: Record<string, boolean>;
  notifications: NotificationPreferences;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setUsersTableColumnVisibility: (visibility: Record<string, boolean>) => void;
  setNotification: (key: keyof NotificationPreferences, enabled: boolean) => void;
  resetPreferences: () => void;
}

export interface NotificationPreferences {
  email: boolean;
  products: boolean;
  orders: boolean;
}

const defaultNotifications: NotificationPreferences = {
  email: true,
  products: true,
  orders: true,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      usersTableColumnVisibility: {},
      notifications: defaultNotifications,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setUsersTableColumnVisibility: (usersTableColumnVisibility) =>
        set({ usersTableColumnVisibility }),
      setNotification: (key, enabled) =>
        set((state) => ({
          notifications: { ...state.notifications, [key]: enabled },
        })),
      resetPreferences: () =>
        set({
          sidebarCollapsed: false,
          usersTableColumnVisibility: {},
          notifications: defaultNotifications,
        }),
    }),
    {
      name: "nexa-preferences",
      version: 2,
      partialize: ({ notifications, sidebarCollapsed, usersTableColumnVisibility }) => ({
        notifications,
        sidebarCollapsed,
        usersTableColumnVisibility,
      }),
      migrate: (persistedState) => {
        const previous = persistedState as Partial<PreferencesState>;

        return {
          ...previous,
          notifications: previous.notifications ?? defaultNotifications,
        } as PreferencesState;
      },
    },
  ),
);
