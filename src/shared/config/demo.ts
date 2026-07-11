export const DEMO_YEAR = 2025;

export function createDemoIsoDate(monthIndex: number, day: number): string {
  return new Date(Date.UTC(DEMO_YEAR, monthIndex, day, 12, 0, 0)).toISOString();
}
