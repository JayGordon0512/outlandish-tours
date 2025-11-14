// components/admin/DeleteBookingButton.tsx
"use client";

import { useState } from "react";

export function DeleteBookingButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Delete this booking? This cannot be undone.")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE"
      });

      // Try to parse JSON but don't crash if it's not JSON
      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        throw new Error(data.error || `Failed to delete booking (HTTP ${res.status})`);
      }

      // Simple approach: reload the page to refresh the list
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to delete booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="text-xs text-red-500 hover:text-red-600"
      >
        {loading ? "Deleting…" : "Delete booking"}
      </button>
      {error && (
        <p className="text-[10px] text-red-500 max-w-[220px] text-right">
          {error}
        </p>
      )}
    </div>
  );
}