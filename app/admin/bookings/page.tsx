// app/admin/bookings/page.tsx
import { prisma } from "@/lib/prisma";
import { DeleteBookingButton } from "@/components/admin/DeleteBookingButton";
import Link from "next/link";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      tour: true,
      user: true,
      extras: {
        include: {
          extraOption: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-highland-ink">Bookings</h2>
      <div className="space-y-2">
        {bookings.map((b) => {
          const extrasSummary =
            b.extras.length === 0
              ? "No extras"
              : b.extras
                  .map(
                    (e) =>
                      `${e.extraOption.name} x${e.quantity} (£${e.totalPrice.toFixed(
                        2
                      )})`
                  )
                  .join(", ");

          return (
            <div
              key={b.id}
              className="border border-highland-stone rounded-2xl p-3 bg-highland-offwhite flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm"
            >
              <div>
                <p className="text-xs text-highland-ink/70">
                  {b.status} ·{" "}
                  {new Date(b.startDate).toLocaleDateString("en-GB")}
                </p>
                <p className="font-semibold text-highland-ink">
                  {b.tour.title}
                </p>
                <p className="text-xs text-highland-ink/70">
                  {b.guests} guest{b.guests !== 1 && "s"} · {b.user.email}
                </p>
                <p className="text-xs text-highland-ink/60">
                  Extras: {extrasSummary}
                </p>
                <p className="text-xs text-highland-ink/60">
                  Total: £{b.totalAmount.toFixed(2)} · Paid: £
                  {b.amountPaid.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <Link
                  href={`/admin/bookings/${b.id}/edit`}
                  className="text-xs px-3 py-1 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold"
                >
                  Edit
                </Link>
                <DeleteBookingButton bookingId={b.id} />
              </div>
            </div>
          );
        })}
        {bookings.length === 0 && (
          <p className="text-sm text-highland-ink/70">No bookings yet.</p>
        )}
      </div>
    </div>
  );
}
