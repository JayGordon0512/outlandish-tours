// app/admin/bookings/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: { id: string };
}

export default async function AdminBookingDetailPage({ params }: PageProps) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      tour: true,
      user: true,
      guide: true,
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

  // Pricing calculations
  const basePrice = booking.tour.pricePerPerson * booking.guests;
  const extrasTotal = booking.extras.reduce((sum, e) => sum + e.totalPrice, 0);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-highland-ink">
            Booking details
          </h1>
          <p className="text-sm text-highland-ink/70">
            View booking #{booking.id.slice(0, 8)} for{" "}
            <span className="font-medium">
              {booking.user?.name || booking.user?.email || "Unknown customer"}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/bookings/${booking.id}/edit`}
            className="px-3 py-1 text-xs rounded-full border border-highland-gold text-highland-ink hover:bg-highland-gold hover:text-highland-offwhite transition"
          >
            Edit booking
          </Link>
          <Link
            href="/admin/bookings"
            className="px-3 py-1 text-xs rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold transition"
          >
            Back to bookings
          </Link>
        </div>
      </div>

      {/* Summary card */}
      <div className="border border-highland-stone rounded-2xl p-4 bg-highland-offwhite space-y-3 text-sm">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-highland-ink/60">
              Tour
            </div>
            <div className="font-semibold text-highland-ink">
              {booking.tour.title}
            </div>
            <div className="text-xs text-highland-ink/60">
              {booking.guests} guest
              {booking.guests !== 1 && "s"} ·{" "}
              {booking.startDate.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs uppercase tracking-wide text-highland-ink/60">
              Status
            </div>
            <div className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium border border-highland-stone text-highland-ink">
              {booking.status}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 mt-3">
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

          <div>
            <div className="text-xs uppercase tracking-wide text-highland-ink/60">
              Created
            </div>
            <div className="text-sm text-highland-ink">
              {booking.createdAt.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div className="text-xs text-highland-ink/70">
              {booking.createdAt.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
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
            {lastPaymentType && (
              <div className="text-xs text-highland-ink/70">
                Last payment: {lastPaymentType} on{" "}
                {lastPaymentAt.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
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
        {booking.extras.length === 0 ? (
          <p className="text-xs text-highland-ink/70">
            No extras have been added to this booking.
          </p>
        ) : (
          <ul className="divide-y divide-highland-stone/60">
            {booking.extras.map((extra) => (
              <li
                key={extra.id}
                className="py-2 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm text-highland-ink">
                    {extra.extraOption.name}
                  </div>
                  <div className="text-xs text-highland-ink/70">
                    Qty {extra.quantity} · £{extra.unitPrice.toFixed(2)} each
                  </div>
                </div>
                <div className="text-sm text-highland-ink font-medium">
                  £{extra.totalPrice.toFixed(2)}
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