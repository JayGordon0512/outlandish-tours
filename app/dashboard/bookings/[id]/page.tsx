// app/dashboard/bookings/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function BookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      tour: true,
      extras: {
        include: {
          extraOption: true,
        },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  const basePrice = booking.tour.pricePerPerson * booking.guests;
  const extrasTotal = booking.extras.reduce((sum, e) => sum + e.totalPrice, 0);
  const total = basePrice + extrasTotal;
  const paid = booking.amountPaid ?? 0;
  const remaining = Math.max(total - paid, 0);

  const lastPaymentAt = booking.updatedAt;
  const lastPaymentAmount = paid;
  const lastPaymentType: "deposit" | "balance" | null =
    paid === 0
      ? null
      : remaining === 0
      ? "balance"
      : "deposit";

  const startDateLabel = new Date(booking.startDate).toLocaleDateString(
    "en-GB",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  const lastPaymentLabel = lastPaymentAt
    ? lastPaymentAt.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <main className="max-w-3xl mx-auto space-y-6">
      {/* Back link */}
      <div className="mt-6">
        <Link
          href="/dashboard"
          className="text-sm text-highland-ink/70 hover:text-highland-gold"
        >
          ← Back to My Trips
        </Link>
      </div>

      {/* Heading */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-highland-ink">
          Booking details
        </h1>
        <p className="text-sm text-highland-ink/70">
          Your Outlandish adventure overview, payments and extras.
        </p>
      </header>

      {/* Core booking summary card */}
      <section className="rounded-2xl border border-highland-stone bg-highland-offwhite p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-highland-ink">
              {booking.tour.title}
            </h2>
            <p className="text-sm text-highland-ink/70">
              {startDateLabel} · {booking.guests}{" "}
              {booking.guests === 1 ? "guest" : "guests"}
            </p>
          </div>

          <div className="text-right text-sm">
            <p className="text-highland-ink/70">Booking reference</p>
            <p className="font-mono text-xs text-highland-ink">
              {booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="border-t border-highland-stone/60 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-highland-ink/80">
              £{booking.tour.pricePerPerson.toFixed(0)} × {booking.guests}{" "}
              {booking.guests === 1 ? "guest" : "guests"}
            </span>
            <span className="font-medium text-highland-ink">
              £{basePrice.toFixed(0)}
            </span>
          </div>

          {booking.extras.length > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-highland-ink/80">Extras</span>
                <span className="font-medium text-highland-ink">
                  £{extrasTotal.toFixed(0)}
                </span>
              </div>
              <ul className="mt-1 space-y-1 text-xs text-highland-ink/70">
                {booking.extras.map((e) => (
                  <li key={e.id} className="flex justify-between">
                    <span>
                      {e.extraOption.name}
                      {e.quantity > 1 ? ` × ${e.quantity}` : ""}
                    </span>
                    <span>£{e.totalPrice.toFixed(0)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="flex justify-between pt-2 border-t border-dashed border-highland-stone/70 mt-2">
            <span className="font-semibold text-highland-ink">Total</span>
            <span className="font-semibold text-highland-ink">
              £{total.toFixed(0)}
            </span>
          </div>
        </div>
      </section>

      {/* Payment status + actions */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Payment summary card */}
        <div className="rounded-2xl border border-highland-stone bg-highland-offwhite p-5 space-y-3 text-sm">
          <h2 className="text-sm font-semibold text-highland-ink">
            Payment status
          </h2>

          <div className="flex items-center justify-between">
            <span className="text-highland-ink/80">Paid so far</span>
            <span className="font-semibold text-highland-ink">
              £{paid.toFixed(0)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-highland-ink/80">Remaining balance</span>
            <span className="font-semibold text-highland-ink">
              £{remaining.toFixed(0)}
            </span>
          </div>

          {lastPaymentType && lastPaymentLabel && (
            <div className="mt-3 rounded-xl bg-highland-stone/20 px-3 py-2 text-xs space-y-1">
              <p className="font-medium text-highland-ink/80">
                Last payment:{" "}
                <span className="uppercase tracking-wide">
                  {lastPaymentType === "deposit" ? "DEPOSIT" : "BALANCE"}
                </span>
              </p>
              <p className="text-highland-ink/70">
                £{lastPaymentAmount.toFixed(0)} on {lastPaymentLabel}
              </p>
            </div>
          )}

          {!lastPaymentType && (
            <p className="mt-3 text-xs text-highland-ink/70">
              No payments recorded yet for this booking.
            </p>
          )}
        </div>

        {/* Actions card */}
        <div className="rounded-2xl border border-highland-stone bg-highland-offwhite p-5 space-y-3 text-sm">
          <h2 className="text-sm font-semibold text-highland-ink">
            Manage this booking
          </h2>
          <p className="text-xs text-highland-ink/70">
            You can pay your deposit or remaining balance securely through your
            dashboard.
          </p>

          <div className="flex flex-wrap gap-3 mt-2">
            {remaining > 0 && (
              <Link
                href={`/dashboard/payment?bookingId=${booking.id}`}
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold bg-highland-gold text-highland-offwhite hover:brightness-110"
              >
                Pay remaining balance
              </Link>
            )}

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold"
            >
              Back to My Trips
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}