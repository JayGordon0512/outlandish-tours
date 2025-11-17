// components/admin/BookingDetailClient.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BookingDetailClientProps {
  bookingId: string;
}

function formatDate(dateStr: string | Date) {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr: string | Date) {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BookingDetailClient({
  bookingId,
}: BookingDetailClientProps) {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load booking from the admin API
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/admin/bookings/${bookingId}`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Request failed with ${res.status} – ${text || "Unknown error"}`
          );
        }

        const data = await res.json();
        if (!cancelled) {
          setBooking(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load booking");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  // Basic chrome reused in all states
  const Header = (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div>
        <h1 className="text-xl font-semibold text-highland-ink">
          Booking details
        </h1>
        {booking && (
          <p className="text-sm text-highland-ink/70">
            Booking #{String(booking.id).slice(0, 8)} for{" "}
            <span className="font-medium">
              {booking.user?.name || booking.user?.email || "Unknown customer"}
            </span>
          </p>
        )}
      </div>
      <div className="flex gap-2">
        {booking && (
          <Link
            href={`/admin/bookings/${booking.id}/edit`}
            className="px-3 py-1 text-xs rounded-full border border-highland-gold text-highland-ink hover:bg-highland-gold hover:text-highland-offwhite transition"
          >
            Edit booking
          </Link>
        )}
        <Link
          href="/admin/bookings"
          className="px-3 py-1 text-xs rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold transition"
        >
          Back to bookings
        </Link>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {Header}
        <p className="text-sm text-highland-ink/70">Loading booking…</p>
      </div>
    );
  }

  // Error / not found state
  if (error || !booking) {
    return (
      <div className="space-y-4">
        {Header}
        <p className="text-sm text-red-700">
          {error || "Booking could not be loaded."}
        </p>
      </div>
    );
  }

  // --- Derived pricing info (mirrors what we had server-side) ---
  const basePrice =
    (booking.tour?.pricePerPerson || 0) * (booking.guests || 0);
  const extrasTotal = Array.isArray(booking.extras)
    ? booking.extras.reduce(
        (sum: number, e: any) => sum + (e.totalPrice || 0),
        0
      )
    : 0;
  const total = basePrice + extrasTotal;
  const paid = booking.amountPaid ?? 0;
  const remaining = Math.max(total - paid, 0);

  const lastPaymentAt = booking.updatedAt;
  const lastPaymentAmount = paid;
  const lastPaymentType: "deposit" | "balance" | null =
    lastPaymentAmount === 0
      ? null
      : remaining === 0
      ? "balance"
      : "deposit";

  const startDateLabel = booking.startDate
    ? `${formatDate(booking.startDate)}`
    : "No date set";

  // --- Render full admin view ---
  return (
    <div className="space-y-6">
      {Header}

      {/* Summary card */}
      <div className="border border-highland-stone rounded-2xl p-4 bg-highland-offwhite space-y-3 text-sm">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-highland-ink/60">
              Tour
            </div>
            <div className="font-semibold text-highland-ink">
              {booking.tour?.title || "Unknown tour"}
            </div>
            <div className="text-xs text-highland-ink/60">
              {booking.guests} guest{booking.guests !== 1 && "s"} ·{" "}
              {startDateLabel}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs uppercase tracking-wide text-highland-ink/60">
              Status
            </div>
            <div className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium border border-highland-stone text-highland-ink">
              {booking.status || "PENDING"}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 mt-3">
          {/* Customer */}
          <div>
            <div className="text-xs uppercase tracking-wide text-highland-ink/60">
              Customer
            </div>
            <div className="text-sm text-highland-ink">
              {booking.user?.name || "Unknown"}
            </div>
            <div className="text-xs text-highland-ink/70">
              {booking.user?.email}
            </div>
          </div>

          {/* Guide */}
          <div>
            <div className="text-xs uppercase tracking-wide text-highland-ink/60">
              Guide
            </div>
            {booking.guide ? (
              <>
                <div className="text-sm text-highland-ink">
                  {booking.guide.firstName} {booking.guide.lastName}
                </div>
                <div className="text-xs text-highland-ink/70">
                  {booking.guide.email}
                </div>
              </>
            ) : (
              <div className="text-xs text-highland-ink/70">
                No guide assigned
              </div>
            )}
          </div>

          {/* Created */}
          <div>
            <div className="text-xs uppercase tracking-wide text-highland-ink/60">
              Created
            </div>
            <div className="text-sm text-highland-ink">
              {formatDate(booking.createdAt)}
            </div>
            <div className="text-xs text-highland-ink/70">
              {formatTime(booking.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Payment summary */}
      <div className="border border-highland-stone rounded-2xl p-4 bg-highland-offwhite space-y-3 text-sm">
        <h2 className="text-sm font-semibold text-highland-ink">
          Payment summary
        </h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-highland-ink/60">
              Base tour
            </div>
            <div className="text-sm text-highland-ink">
              £{basePrice.toFixed(2)}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-highland-ink/60">
              Extras
            </div>
            <div className="text-sm text-highland-ink">
              £{extrasTotal.toFixed(2)}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-highland-ink/60">
              Paid
            </div>
            <div className="text-sm text-highland-ink">
              £{lastPaymentAmount.toFixed(2)}
            </div>
            {lastPaymentType && lastPaymentAt && (
              <div className="text-xs text-highland-ink/70">
                Last payment: {lastPaymentType} on {formatDate(lastPaymentAt)}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-highland-ink/60">
              Remaining
            </div>
            <div className="text-sm font-semibold text-highland-ink">
              £{remaining.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Extras list */}
      <div className="border border-highland-stone rounded-2xl p-4 bg-highland-offwhite space-y-3 text-sm">
        <h2 className="text-sm font-semibold text-highland-ink">
          Extras on this booking
        </h2>
        {!Array.isArray(booking.extras) || booking.extras.length === 0 ? (
          <p className="text-xs text-highland-ink/70">
            No extras have been added to this booking.
          </p>
        ) : (
          <ul className="divide-y divide-highland-stone/60">
            {booking.extras.map((extra: any) => (
              <li
                key={extra.id}
                className="py-2 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm text-highland-ink">
                    {extra.extraOption?.name || "Extra"}
                  </div>
                  <div className="text-xs text-highland-ink/70">
                    Qty {extra.quantity} · £
                    {(extra.unitPrice ?? 0).toFixed(2)} each
                  </div>
                </div>
                <div className="text-sm text-highland-ink font-medium">
                  £{(extra.totalPrice ?? 0).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Admin notes */}
      <div className="border border-highland-stone rounded-2xl p-4 bg-highland-offwhite space-y-2 text-sm">
        <h2 className="text-sm font-semibold text-highland-ink">Admin notes</h2>
        {booking.adminNotes ? (
          <p className="text-sm text-highland-ink/80 whitespace-pre-wrap">
            {booking.adminNotes}
          </p>
        ) : (
          <p className="text-xs text-highland-ink/70">
            No admin notes have been added to this booking yet.
          </p>
        )}
      </div>
    </div>
  );
}