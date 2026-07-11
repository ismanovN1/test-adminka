"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, Languages, Moon, RotateCcw, Sun, Monitor, UserRound, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { usePreferencesStore } from "@/features/preferences/preferences-store";
import { profileSchema, type ProfileFormValues } from "@/features/settings/model/profile-schema";
import { localeCookieName, type AppLocale } from "@/shared/i18n/config";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

const themeOptions = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
] as const;

export function SettingsWorkflow() {
  const t = useTranslations("settings");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const notifications = usePreferencesStore((state) => state.notifications);
  const setNotification = usePreferencesStore((state) => state.setNotification);
  const resetPreferences = usePreferencesStore((state) => state.resetPreferences);
  const [resetOpen, setResetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "Nexa", lastName: "Admin", email: "admin@nexa.local", role: "Administrator" },
  });
  useEffect(() => setMounted(true), []);
  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");
  const initials = `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() || "NA";

  const changeLocale = (next: AppLocale) => {
    if (next === locale) return;
    document.cookie = `${localeCookieName}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    router.refresh();
  };
  const saveProfile = (values: ProfileFormValues) => {
    form.reset(values);
    toast.success(t("profile.saved"), { description: t("profile.localOnly") });
  };
  const confirmReset = () => {
    resetPreferences();
    setTheme("system");
    document.cookie = `${localeCookieName}=ru; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = "ru";
    setResetOpen(false);
    toast.success(t("reset.done"));
    router.refresh();
  };

  return <div className="grid gap-5 xl:grid-cols-2">
    <Card>
      <div className="flex items-start gap-3"><span className="rounded-xl bg-primary-subtle p-2 text-primary-subtle-foreground"><Sun className="size-5" /></span><div><h2 className="font-semibold">{t("appearance.title")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("appearance.description")}</p></div></div>
      <div aria-label={t("appearance.group")} className="mt-5 grid gap-2 sm:grid-cols-3" role="group">{mounted ? themeOptions.map(({ icon: Icon, value }) => <Button aria-pressed={theme === value} key={value} onClick={() => setTheme(value)} variant={theme === value ? "primary" : "secondary"}><Icon className="size-4" />{t(`appearance.${value}`)}</Button>) : <div className="h-11 sm:col-span-3" />}</div>
    </Card>
    <Card>
      <div className="flex items-start gap-3"><span className="rounded-xl bg-primary-subtle p-2 text-primary-subtle-foreground"><Languages className="size-5" /></span><div><h2 className="font-semibold">{t("language.title")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("language.description")}</p></div></div>
      <div aria-label={t("language.group")} className="mt-5 grid grid-cols-2 gap-2" role="group"><Button aria-pressed={locale === "ru"} onClick={() => changeLocale("ru")} variant={locale === "ru" ? "primary" : "secondary"}>{t("language.ru")}</Button><Button aria-pressed={locale === "en"} onClick={() => changeLocale("en")} variant={locale === "en" ? "primary" : "secondary"}>{t("language.en")}</Button></div>
    </Card>
    <Card>
      <div className="flex items-start gap-3"><span className="rounded-xl bg-primary-subtle p-2 text-primary-subtle-foreground"><Bell className="size-5" /></span><div><h2 className="font-semibold">{t("notifications.title")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("notifications.description")}</p></div></div>
      <div className="mt-5 divide-y divide-border">{(["email", "products", "orders"] as const).map((key) => <NotificationSwitch checked={notifications[key]} description={t(`notifications.${key}Description`)} key={key} label={t(`notifications.${key}`)} onChange={(checked) => setNotification(key, checked)} />)}</div>
    </Card>
    <Card className="xl:row-span-2">
      <div className="flex items-start gap-3"><span className="rounded-xl bg-primary-subtle p-2 text-primary-subtle-foreground"><UserRound className="size-5" /></span><div><h2 className="font-semibold">{t("profile.title")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("profile.description")}</p></div></div>
      <div className="mt-5 flex items-center gap-4"><span aria-label={t("profile.avatar", { initials })} className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">{initials}</span><p className="text-sm leading-6 text-muted-foreground">{t("profile.avatarDescription")}</p></div>
      <form className="mt-5 grid gap-4 sm:grid-cols-2" noValidate onSubmit={form.handleSubmit(saveProfile)}>
        <FormField error={form.formState.errors.firstName?.message} id="profile-first-name" label={t("profile.firstName")} translation={t} input={<Input aria-describedby={form.formState.errors.firstName ? "profile-first-name-error" : undefined} aria-invalid={Boolean(form.formState.errors.firstName)} autoComplete="given-name" id="profile-first-name" {...form.register("firstName")} />} />
        <FormField error={form.formState.errors.lastName?.message} id="profile-last-name" label={t("profile.lastName")} translation={t} input={<Input aria-describedby={form.formState.errors.lastName ? "profile-last-name-error" : undefined} aria-invalid={Boolean(form.formState.errors.lastName)} autoComplete="family-name" id="profile-last-name" {...form.register("lastName")} />} />
        <FormField className="sm:col-span-2" error={form.formState.errors.email?.message} id="profile-email" label={t("profile.email")} translation={t} input={<Input aria-describedby={form.formState.errors.email ? "profile-email-error" : undefined} aria-invalid={Boolean(form.formState.errors.email)} autoComplete="email" id="profile-email" type="email" {...form.register("email")} />} />
        <FormField className="sm:col-span-2" error={form.formState.errors.role?.message} id="profile-role" label={t("profile.role")} translation={t} input={<Input aria-describedby={form.formState.errors.role ? "profile-role-error" : undefined} aria-invalid={Boolean(form.formState.errors.role)} autoComplete="organization-title" id="profile-role" {...form.register("role")} />} />
        <Button className="sm:col-span-2 sm:justify-self-start" disabled={form.formState.isSubmitting} type="submit">{t("profile.save")}</Button>
      </form>
    </Card>
    <Card className="border-rose-500/25">
      <h2 className="font-semibold">{t("reset.title")}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("reset.description")}</p><Button className="mt-5" onClick={() => setResetOpen(true)} variant="secondary"><RotateCcw className="size-4" />{t("reset.action")}</Button>
    </Card>
    <ResetDialog onCancel={() => setResetOpen(false)} onConfirm={confirmReset} open={resetOpen} />
  </div>;
}

function NotificationSwitch({ checked, description, label, onChange }: { checked: boolean; description: string; label: string; onChange: (checked: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div><p className="text-sm font-medium">{label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div><button aria-checked={checked} aria-label={label} className={`relative h-7 w-12 shrink-0 rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none ${checked ? "bg-primary" : "bg-muted"}`} onClick={() => onChange(!checked)} role="switch" type="button"><span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${checked ? "left-6" : "left-1"}`} /></button></div>;
}

function FormField({ className = "", error, id, input, label, translation }: { className?: string; error?: string; id: string; input: ReactNode; label: string; translation: (key: string) => string }) {
  return <div className={`${className} flex flex-col gap-1 text-sm font-medium`}><label htmlFor={id}>{label}</label>{input}{error ? <span className="text-xs text-rose-600" id={`${id}-error`} role="alert">{translation(`profile.errors.${error}`)}</span> : null}</div>;
}

function ResetDialog({ onCancel, onConfirm, open }: { onCancel: () => void; onConfirm: () => void; open: boolean }) {
  const t = useTranslations("settings.reset");
  const cancelRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelRef.current?.focus();
    const keydown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
      if (event.key !== "Tab") return;
      const controls = rootRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])');
      const first = controls?.[0]; const last = controls?.[controls.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); previous?.focus(); };
  }, [onCancel, open]);
  if (!open) return null;
  return <div aria-describedby="reset-description" aria-labelledby="reset-title" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="alertdialog"><button aria-label={t("cancel")} className="absolute inset-0 cursor-default" onClick={onCancel} tabIndex={-1} /><div className="relative w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl" ref={rootRef}><Button aria-label={t("cancel")} className="absolute right-3 top-3 size-11 px-0" onClick={onCancel} variant="ghost"><X className="size-5" /></Button><h2 className="pr-12 text-xl font-semibold" id="reset-title">{t("confirmTitle")}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground" id="reset-description">{t("confirmDescription")}</p><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button onClick={onCancel} ref={cancelRef} variant="secondary">{t("cancel")}</Button><Button onClick={onConfirm}>{t("confirm")}</Button></div></div></div>;
}
