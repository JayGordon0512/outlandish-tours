// src/lib/utils/tourFormat.ts

type AnyTour = Record<string, any>;

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0
});

export function formatGBP(value: unknown): string | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return gbp.format(n);
}

/**
 * pricingMode:
 * 0 = per tour
 * 1 = per person
 */
export function formatPrice(tour: AnyTour): string {
  const money = formatGBP(tour.price);
  if (!money) return "Price on request";

  const mode = tour.pricingMode;
  if (mode === 0) return `From ${money} per tour`;
  if (mode === 1) return `From ${money} per person`;

  // fallback if mode is missing/unknown
  return `From ${money}`;
}

export function formatDurationDays(durationDays: unknown): string | null {
  const d = typeof durationDays === "number" ? durationDays : Number(durationDays);
  if (!Number.isFinite(d) || d <= 0) return null;
  return `${d} day${d === 1 ? "" : "s"}`;
}

export function formatMaxGroupSize(maxGroupSize: unknown): string | null {
  const m = typeof maxGroupSize === "number" ? maxGroupSize : Number(maxGroupSize);
  if (!Number.isFinite(m) || m <= 0) return null;
  return `Max ${m} guests`;
}