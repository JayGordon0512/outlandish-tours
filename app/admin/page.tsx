// app/admin/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminOverviewPage() {
  const [tourCount, bookingCount, guideCount] = await Promise.all([
    prisma.tour.count(),
    prisma.booking.count(),
    prisma.guide.count(),
  ]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-highland-ink">
          Admin Dashboard
        </h1>
        <p className="text-sm text-highland-ink/70">
          Manage tours, bookings and guides.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/tours"
          className="rounded-2xl border border-highland-stone bg-highland-offwhite p-4 hover:border-highland-gold transition"
        >
          <p className="text-xs text-highland-ink/60">Tours</p>
          <p className="text-2xl font-semibold text-highland-ink">
            {tourCount}
          </p>
          <p className="mt-1 text-xs text-highland-ink/70">
            Create &amp; edit Outlandish tours.
          </p>
        </Link>

        <Link
          href="/admin/bookings"
          className="rounded-2xl border border-highland-stone bg-highland-offwhite p-4 hover:border-highland-gold transition"
        >
          <p className="text-xs text-highland-ink/60">Bookings</p>
          <p className="text-2xl font-semibold text-highland-ink">
            {bookingCount}
          </p>
          <p className="mt-1 text-xs text-highland-ink/70">
            See upcoming trips and guests.
          </p>
        </Link>

        {/* NEW: Guides card */}
        <Link
          href="/admin/guides"
          className="rounded-2xl border border-highland-stone bg-highland-offwhite p-4 hover:border-highland-gold transition"
        >
          <p className="text-xs text-highland-ink/60">Guides</p>
          <p className="text-2xl font-semibold text-highland-ink">
            {guideCount}
          </p>
          <p className="mt-1 text-xs text-highland-ink/70">
            Manage Outlandish guides &amp; assignments.
          </p>
        </Link>
      </section>
    </main>
  );
}