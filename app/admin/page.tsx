import { prisma } from "@/lib/prisma";

export default async function AdminHome() {
  const [tourCount, bookingCount, customerCount] = await Promise.all([
    prisma.tour.count(),
    prisma.booking.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } })
  ]);

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="border border-highland-stone rounded-2xl p-4 bg-highland-offwhite">
        <p className="text-xs text-highland-ink/70">Tours</p>
        <p className="text-3xl font-semibold text-highland-ink">{tourCount}</p>
      </div>
      <div className="border border-highland-stone rounded-2xl p-4 bg-highland-offwhite">
        <p className="text-xs text-highland-ink/70">Bookings</p>
        <p className="text-3xl font-semibold text-highland-ink">{bookingCount}</p>
      </div>
      <div className="border border-highland-stone rounded-2xl p-4 bg-highland-offwhite">
        <p className="text-xs text-highland-ink/70">Customers</p>
        <p className="text-3xl font-semibold text-highland-ink">{customerCount}</p>
      </div>
    </div>
  );
}