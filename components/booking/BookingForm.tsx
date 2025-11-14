// components/booking/BookingForm.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ExtraOption, ExtraChargeType } from "@prisma/client";

interface BookingFormProps {
  tour: {
    id: string;
    title: string;
    pricePerPerson: number;
    maxGroupSize: number;
  };
  extras: ExtraOption[];
}

export function BookingForm({ tour, extras }: BookingFormProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleExtra(id: string) {
    setSelectedExtraIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  const pricing = useMemo(() => {
    const baseTotal = tour.pricePerPerson * guests;

    const selectedExtras = extras.filter(e =>
      selectedExtraIds.includes(e.id)
    );

    const extraLines = selectedExtras.map(e => {
      const qty =
        e.chargeType === "PER_PERSON" ? guests : 1;
      const lineTotal = e.price * qty;
      return { extra: e, qty, lineTotal };
    });

    const extrasTotal = extraLines.reduce(
      (sum, line) => sum + line.lineTotal,
      0
    );

    const total = baseTotal + extrasTotal;

    return { baseTotal, extraLines, extrasTotal, total };
  }, [tour.pricePerPerson, guests, selectedExtraIds, extras]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId: tour.id,
          startDate,
          guests,
          extraOptionIds: selectedExtraIds
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      // After booking, send them to their dashboard or confirmation
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-highland-offwhite border border-highland-stone rounded-2xl p-4 text-sm"
    >
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-highland-ink">
          Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-highland-ink">
          Guests
        </label>
        <input
          type="number"
          min={1}
          max={tour.maxGroupSize}
          value={guests}
          onChange={e => setGuests(Number(e.target.value) || 1)}
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
        />
        <p className="text-[11px] text-highland-ink/60">
          Maximum {tour.maxGroupSize} guests.
        </p>
      </div>

      {/* Extras selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-highland-ink">
          Extras (optional)
        </label>
        {extras.length === 0 ? (
          <p className="text-xs text-highland-ink/60">
            No paid extras are available for this tour.
          </p>
        ) : (
          <div className="space-y-2 text-xs">
            {extras.map(extra => {
              const isSelected = selectedExtraIds.includes(extra.id);
              const qty =
                extra.chargeType === "PER_PERSON" ? guests : 1;
              const lineTotal = isSelected ? extra.price * qty : 0;

              return (
                <label
                  key={extra.id}
                  className="flex items-start gap-2 border border-highland-stone rounded-xl px-3 py-2 bg-highland-stone/20"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleExtra(extra.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-highland-ink">
                        {extra.name}
                      </span>
                      <span className="font-semibold text-highland-gold">
                        £{extra.price}
                        <span className="text-[10px] text-highland-ink/60 ml-1">
                          {extra.chargeType === "PER_PERSON"
                            ? "per person"
                            : "per tour"}
                        </span>
                      </span>
                    </div>
                    {extra.description && (
                      <p className="text-[11px] text-highland-ink/70 mt-0.5">
                        {extra.description}
                      </p>
                    )}
                    {isSelected && (
                      <p className="text-[11px] text-highland-ink/60 mt-0.5">
                        Applied as {qty} × £{extra.price} = £{lineTotal}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="border border-highland-stone rounded-xl p-3 bg-highland-stone/10 space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Base ({guests} × £{tour.pricePerPerson})</span>
          <span>£{pricing.baseTotal}</span>
        </div>
        {pricing.extraLines.map(line => (
          <div key={line.extra.id} className="flex justify-between">
            <span>
              {line.extra.name} ({line.qty} × £{line.extra.price})
            </span>
            <span>£{line.lineTotal}</span>
          </div>
        ))}
        <div className="border-t border-highland-stone mt-1 pt-1 flex justify-between font-semibold text-highland-ink">
          <span>Total</span>
          <span>£{pricing.total}</span>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading || !startDate}
        className="rounded-full bg-highland-gold text-highland-offwhite px-5 py-2 text-xs font-semibold hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Booking…" : "Confirm booking"}
      </button>
    </form>
  );
}