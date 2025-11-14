// app/admin/bookings/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type SearchParams = {
  q?: string;
  status?: string;
  from?: string;
  to?: string;
};

export default async function AdminBookingsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const { q, status, from, to } = searchParams;

  const where: any = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (from || to) {
    where.startDate = {};
    if (from) {
      where.startDate.gte = new Date(from);
    }
    if (to) {
      // add one day so the "to" date is inclusive
      const end = new Date(to);
      end.setDate(end.getDate() + 1);
      where.startDate.lt = end;
    }
  }

  if (q && q.trim()) {
    const term = q.trim();
    where.OR = [
      { user: { email: { contains: term, mode: "insensitive" } } },
      { tour: { title: { contains: term, mode: "insensitive" } } }
    ];
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      tour: true,
      user: true,
      extras: {
        include: {
          extraOption: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const statusOptions = [
    "ALL",
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "COMPLETED"
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-highland-ink">Bookings</h2>
          <p className="text-xs text-highland-ink/70">
            Search, filter and review all bookings. Click a booking to edit
            details or add admin notes.
          </p>
        </div>

        {/* Search + filters */}
        <form className="flex flex-wrap gap-2 text-xs items-end">
          <div className="flex flex-col">
            <label className="mb-1">Search</label>
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Customer, tour…"
              className="rounded-full border border-highland-stone bg-highland-offwhite px-3 py-1"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1">Status</label>
            <select
              name="status"
              defaultValue={status ?? "ALL"}
              className="rounded-full border border-highland-stone bg-highland-offwhite px-3 py-1"
            >
              {statusOptions.map(s => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All statuses" : s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1">From</label>
            <input
              type="date"
              name="from"
              defaultValue={from ?? ""}
              className="rounded-full border border-highland-stone bg-highland-offwhite px-3 py-1"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1">To</label>
            <input
              type="date"
              name="to"
              defaultValue={to ?? ""}
              className="rounded-full border border-highland-stone bg-highland-offwhite px-3 py-1"
            />
          </div>

          <button
            type="submit"
            className="rounded-full bg-highland-gold text-highland-offwhite px-4 py-1 font-semibold hover:brightness-110"
          >
            Apply
          </button>
        </form>
      </div>

      <div className="space-y-2">
        {bookings.map(b => {
          const extrasSummary =
            b.extras.length === 0
              ? "No extras"
              : b.extras
                  .map(
                    e =>
                      `${e.extraOption.name} x${e.quantity} (£${e.totalPrice})`
                  )
                  .join(", ");

          return (
            <Link
              key={b.id}
              href={`/admin/bookings/${b.id}/edit`}
              className="block"
            >
              <div className="border border-highland-stone rounded-2xl p-3 bg-highland-offwhite flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm hover:border-highland-gold/80 transition-colors">
                <div className="space-y-1">
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
                  {b.adminNotes && (
                    <p className="text-[11px] text-highland-ink/70 mt-1 line-clamp-2">
                      <span className="font-semibold">Admin notes: </span>
                      {b.adminNotes}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-end text-[11px] text-highland-ink/70">
                  <span>Created: {b.createdAt.toLocaleDateString("en-GB")}</span>
                  <span>Updated: {b.updatedAt.toLocaleDateString("en-GB")}</span>
                  <span className="mt-1 text-highland-gold font-semibold">
                    View / edit →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
        {bookings.length === 0 && (
          <p className="text-sm text-highland-ink/70">No bookings found.</p>
        )}
      </div>
    </div>
  );
}