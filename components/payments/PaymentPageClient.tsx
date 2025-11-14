// components/payments/PaymentPageClient.tsx
"use client";

import { useState } from "react";

interface PaymentPageClientProps {
  bookingId: string;
  mode: "deposit" | "balance";
  total: number;
  paid: number;
  remaining: number;
  amountToPay: number;
}

export function PaymentPageClient({
  bookingId,
  mode,
  total,
  paid,
  remaining,
  amountToPay
}: PaymentPageClientProps) {
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [loadingMock, setLoadingMock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label =
    mode === "deposit" ? "Pay 50% deposit" : "Pay remaining balance";

  async function handleStripePay() {
    setError(null);
    setLoadingStripe(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          mode
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Unable to start Stripe checkout.");
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Something went wrong starting payment.");
      setLoadingStripe(false);
    }
  }

  async function handleMockPay() {
    setError(null);
    setLoadingMock(true);
    try {
      const res = await fetch("/api/payments/mock-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          mode
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Unable to mark booking as paid.");
      }

      window.location.href = "/dashboard?payment=success";
    } catch (err: any) {
      setError(err.message || "Something went wrong updating booking.");
      setLoadingMock(false);
    }
  }

  return (
    <div className="space-y-4 border border-highland-stone rounded-2xl bg-highland-offwhite p-4 text-sm">
      <div className="space-y-1">
        <p className="flex justify-between">
          <span className="text-highland-ink/70">Total tour cost</span>
          <span className="font-semibold text-highland-ink">
            £{total.toFixed(2)}
          </span>
        </p>
        <p className="flex justify-between">
          <span className="text-highland-ink/70">Already paid</span>
          <span className="font-semibold text-highland-ink">
            £{paid.toFixed(2)}
          </span>
        </p>
        <p className="flex justify-between">
          <span className="text-highland-ink/70">Outstanding balance</span>
          <span className="font-semibold text-highland-ink">
            £{remaining.toFixed(2)}
          </span>
        </p>
        <hr className="border-highland-stone/60 my-2" />
        <p className="flex justify-between text-base">
          <span className="font-semibold text-highland-ink">
            {label}
          </span>
          <span className="font-semibold text-highland-gold">
            £{amountToPay.toFixed(2)}
          </span>
        </p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="space-y-2">
        <button
          type="button"
          onClick={handleStripePay}
          disabled={loadingStripe || loadingMock}
          className="w-full rounded-full bg-highland-gold text-highland-offwhite px-5 py-2 text-xs font-semibold hover:brightness-110 disabled:opacity-60"
        >
          {loadingStripe ? "Redirecting to Stripe…" : "Pay with Stripe"}
        </button>

        <button
          type="button"
          onClick={handleMockPay}
          disabled={loadingStripe || loadingMock}
          className="w-full rounded-full border border-dashed border-highland-stone text-highland-ink px-5 py-2 text-[11px] hover:border-highland-gold hover:text-highland-gold disabled:opacity-60"
        >
          {loadingMock
            ? "Marking as paid…"
            : "Simulate payment (dev only – updates booking instantly)"}
        </button>

        <p className="text-[11px] text-highland-ink/60 text-center">
          In production, guests will pay securely via Stripe. The simulate
          option is just for testing your flows without taking real payments.
        </p>
      </div>
    </div>
  );
}