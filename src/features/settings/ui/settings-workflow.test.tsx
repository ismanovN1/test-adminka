import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePreferencesStore } from "@/features/preferences/preferences-store";

import { SettingsWorkflow } from "./settings-workflow";

const mocks = vi.hoisted(() => ({
  setTheme: vi.fn(),
  refresh: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "system", setTheme: mocks.setTheme }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("next-intl", () => ({ useLocale: () => "ru", useTranslations: (namespace?: string) => (key: string, values?: Record<string, string | number>) => `${namespace ? `${namespace}.` : ""}${key}${values ? ` ${Object.values(values).join(" ")}` : ""}` }));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess } }));

describe("SettingsWorkflow", () => {
  beforeEach(() => {
    mocks.setTheme.mockReset(); mocks.refresh.mockReset(); mocks.toastSuccess.mockReset();
    usePreferencesStore.setState({ notifications: { email: true, products: true, orders: true } });
  });
  afterEach(cleanup);

  it("persists approved notification preferences only", () => {
    render(createElement(SettingsWorkflow));
    const emailSwitch = screen.getByRole("switch", { name: "settings.notifications.email" });
    fireEvent.click(emailSwitch);
    expect(emailSwitch).toHaveAttribute("aria-checked", "false");
    expect(usePreferencesStore.getState().notifications.email).toBe(false);
  });

  it("associates profile validation errors and saves valid local data", async () => {
    render(createElement(SettingsWorkflow));
    fireEvent.change(screen.getByLabelText("settings.profile.email"), { target: { value: "invalid" } });
    fireEvent.click(screen.getByRole("button", { name: "settings.profile.save" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("settings.profile.errors.email");
    fireEvent.change(screen.getByLabelText("settings.profile.email"), { target: { value: "admin@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "settings.profile.save" }));
    await waitFor(() => expect(mocks.toastSuccess).toHaveBeenCalled());
  });

  it("confirms reset and closes the focus-managed dialog with Escape", () => {
    render(createElement(SettingsWorkflow));
    fireEvent.click(screen.getByRole("button", { name: "settings.reset.action" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
