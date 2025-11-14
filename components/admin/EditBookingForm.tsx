// components/admin/EditBookingForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BookingWithRelations = {
  id: string;
  status: string;
  guests: number;
  amountPaid: number;
  totalAmount: number;
  adminNotes?: string | null;
  startDate: string | Date;
  tour: { title: string };
  user: { email: string };
};

export function EditBookingForm({ booking }: { booking: BookingWithRelations }) {
  const [status, setStatus] = useState<string>(booking.status);
  const [guests, setGuests] = useState<number>(booking.guests);
  const [amountPaid, setAmountPaid] = useState<number>(booking.amountPaid);
  const [totalAmount, setTotalAmount] = useState<number>(booking.totalAmount);
  const [adminNotes, setAdminNotes] = useState<string>(booking.adminNotes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          guests,
          amountPaid,
          totalAmount,
          adminNotes: adminNotes.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to update booking");
      }

      router.push("/admin/bookings");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const startDate =
    typeof booking.startDate === "string"
      ? new Date(booking.startDate)
      : booking.startDate;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-highland-offwhite border border-highland-stone rounded-2xl p-4 text-sm"
    >
      <div className="space-y-1">
        <p className="text-xs text-highland-ink/70">Booking for</p>
        <p className="font-semibold text-highland-ink">{booking.tour.title}</p>
        <p className="text-xs text-highland-ink/70">
          {booking.user.email} · {startDate.toLocaleDateString("en-GB")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink text-xs"
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="space-y-1">
          <label>Guests</label>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label>Total amount (£)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={totalAmount}
            onChange={(e) => setTotalAmount(Number(e.target.value))}
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink text-xs"
          />
        </div>

        <div className="space-y-1">
          <label>Amount paid (£)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={amountPaid}
            onChange={(e) => setAmountPaid(Number(e.target.value))}
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink text-xs"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label>Admin notes (internal only)</label>
        <textarea
          rows={4}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink text-xs"
          placeholder="E.g. balance due on arrival, VIP client, special requests, manual adjustments, etc."
        />
        <p className="text-[11px] text-highland-ink/60">
          These notes are visible only in the admin and are not emailed to the guest.
        </p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-highland-gold text-highland-offwhite px-5 py-2 text-xs font-semibold hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/bookings")}
          className="text-xs text-highland-ink/70 hover:text-highland-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}