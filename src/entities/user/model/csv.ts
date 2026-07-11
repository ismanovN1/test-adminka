import type { User } from "./types";

const csvHeaders = [
  "ID",
  "Full Name",
  "Email",
  "Phone",
  "Company",
  "Department",
  "Country",
  "Status",
] as const;

function escapeCsvCell(value: string | number): string {
  const raw = String(value);
  const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  const escaped = safe.replaceAll('"', '""');

  return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

export function makeUsersCsv(users: readonly User[]): string {
  const rows = users.map((user) => [
    user.id,
    user.fullName,
    user.email,
    user.phone,
    user.companyName,
    user.department,
    user.country,
    user.status,
  ]);

  return `\uFEFF${[csvHeaders, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n")}\r\n`;
}

export function makeUsersCsvFileName(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `users-${year}-${month}-${day}.csv`;
}
