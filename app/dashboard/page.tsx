// app/dashboard/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user as any;
  const userId = user.id as string;

  // Fetch all bookings for this user
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      tour: true,
      extras: {
        include: {
          extraOption: true,
        },
      },
    },
    orderBy: {
      startDate: "asc",
    },
  });

  const now = new Date();

  const upcomingBookings = bookings.filter(
    (b) => b.startDate >= now
  );
  const pastBookings = bookings.filter(
    (b) => b.startDate < now
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER */}
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold text-highland-ink">
          Your dashboard
        </h1>
        <p className="text-sm md:text-base text-highland-ink/70">
          View your upcoming Outlandish tours, manage bookings and review past adventures.
        </p>
      </header>

      {/* QUICK ACTIONS */}
      <section className="flex flex-wrap gap-3">
        <Link
          href="/tours"
          className="px-4 py-2 rounded-full text-sm font-medium bg-highland-gold text-highland-offwhite hover:brightness-110 transition"
        >
          Browse tours
        </Link>
        <Link
          href="/dashboard/book"
          className="px-4 py-2 rounded-full text-sm font-medium border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold transition"
        >
          Start a new booking
        </Link>
      </section>

      {/* UPCOMING BOOKINGS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg md:text-xl font-semibold text-highland-ink">
            Upcoming bookings
          </h2>
          {upcomingBookings.length > 0 && (
            <span className="text-xs md:text-sm text-highland-ink/60">
              {upcomingBookings.length} upcoming
            </span>
          )}
        </div>

        {upcomingBookings.length === 0 ? (
          <p className="text-sm text-highland-ink/70">
            You don&apos;t have any upcoming tours yet. Once you book, your adventures will appear here.
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => {
              const basePrice =
                booking.tour.pricePerPerson * booking.guests;
              const extrasTotal = booking.extras.reduce(
                (sum, e) => sum + e.totalPrice,
                0
              );
              const total = basePrice + extrasTotal;
              const paid = booking.amountPaid ?? 0;
              const remaining = Math.max(total - paid, 0);

              const startDate = new Date(booking.startDate);
              const startDateLabel = startDate.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              const statusLabel = booking.status ?? "PENDING";

              // Derive a simple "last payment" summary from existing fields
              const lastPaymentAt = new Date(booking.updatedAt);
              const lastPaymentAmount = paid;
              const lastPaymentType: "deposit" | "balance" | null =
                lastPaymentAmount === 0
                  ? null
                  : remaining === 0
                  ? "balance"
                  : "deposit";

              return (
                <Link
                  key={booking.id}
                  href={`/dashboard/bookings/${booking.id}`}
                  className="block rounded-2xl border border-highland-stone bg-highland-offwhite hover:border-highland-gold transition p-4 md:p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-highland-ink/60 uppercase tracking-wide">
                        {statusLabel}
                      </p>
                      <h3 className="text-base md:text-lg font-semibold text-highland-ink">
                        {booking.tour.title}
                      </h3>
                      <p className="text-sm text-highland-ink/70">
                        {startDateLabel} &middot; {booking.guests}{" "}
                        guest{booking.guests !== 1 && "s"}
                      </p>

                      {booking.extras.length > 0 && (
                        <p className="text-xs text-highland-ink/60 mt-1">
                          Extras:{" "}
                          {booking.extras
                            .map((e) => {
                              const label = e.extraOption.name;
                              return e.quantity > 1
                                ? `${label} × ${e.quantity}`
                                : label;
                            })
                            .join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 text-right text-xs md:text-sm">
                      <div>
                        <p className="text-highland-ink/70">Total</p>
                        <p className="text-base font-semibold text-highland-ink">
                          £{(total / 100).toFixed(2)}
                        </p>
                      </div>

                      <div className="text-[11px] md:text-xs text-highland-ink/70">
                        <p>Paid: £{(paid / 100).toFixed(2)}</p>
                        <p>Remaining: £{(remaining / 100).toFixed(2)}</p>
                      </div>

                      {lastPaymentType && (
                        <p className="text-[11px] text-highland-ink/60 mt-1">
                          Last payment:{" "}
                          {lastPaymentType === "deposit"
                            ? "Deposit"
                            : "Balance"}{" "}
                          on{" "}
                          {lastPaymentAt.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}

                      <span className="mt-2 inline-flex items-center text-[11px] md:text-xs font-semibold text-highland-gold">
                        View booking details →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* PAST BOOKINGS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg md:text-xl font-semibold text-highland-ink">
            Past bookings
          </h2>
          {pastBookings.length > 0 && (
            <span className="text-xs md:text-sm text-highland-ink/60">
              {pastBookings.length} completed
            </span>
          )}
        </div>

        {pastBookings.length === 0 ? (
          <p className="text-sm text-highland-ink/70">
            Once you&apos;ve travelled with us, your past tours will appear here so you
            can look back on your journeys.
          </p>
        ) : (
          <div className="space-y-3">
            {pastBookings.map((booking) => {
              const basePrice =
                booking.tour.pricePerPerson * booking.guests;
              const extrasTotal = booking.extras.reduce(
                (sum, e) => sum + e.totalPrice,
                0
              );
              const total = basePrice + extrasTotal;
              const paid = booking.amountPaid ?? 0;

              const startDate = new Date(booking.startDate);
              const startDateLabel = startDate.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <Link
                  key={booking.id}
                  href={`/dashboard/bookings/${booking.id}`}
                  className="block rounded-2xl border border-highland-stone bg-highland-offwhite hover:border-highland-gold transition p-4 md:p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-highland-ink/60 uppercase tracking-wide">
                        Completed
                      </p>
                      <h3 className="text-base md:text-lg font-semibold text-highland-ink">
                        {booking.tour.title}
                      </h3>
                      <p className="text-sm text-highland-ink/70">
                        {startDateLabel} &middot; {booking.guests}{" "}
                        guest{booking.guests !== 1 && "s"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 text-right text-xs md:text-sm">
                      <p className="text-highland-ink/70">Total paid</p>
                      <p className="text-base font-semibold text-highland-ink">
                        £{(paid / 100).toFixed(2)}
                      </p>
                      <span className="mt-2 inline-flex items-center text-[11px] md:text-xs font-semibold text-highland-gold">
                        View booking summary →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}