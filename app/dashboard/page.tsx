// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface PageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userId = (session.user as any).id;

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      tour: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  const paymentParam = searchParams?.payment;
  const paymentStatus = Array.isArray(paymentParam)
    ? paymentParam[0]
    : paymentParam;
  const showPaymentSuccess = paymentStatus === "success";

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const upcoming = bookings.filter(
    (b) => new Date(b.startDate) >= todayStart
  );
  const past = bookings.filter((b) => new Date(b.startDate) < todayStart);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-highland-ink">My trips</h1>
        <p className="text-sm text-highland-ink/70">
          View your upcoming Outlandish tours, balances and payment options.
        </p>
      </header>

      {showPaymentSuccess && (
        <div className="border border-green-600/40 bg-green-600/10 text-green-800 text-xs rounded-2xl px-4 py-3">
          <p className="font-semibold mb-0.5">Payment successful</p>
          <p>
            Your payment has been recorded. You&apos;ll see the updated balance
            and payment history on your trip below.
          </p>
        </div>
      )}

      {bookings.length === 0 && (
        <p className="text-sm text-highland-ink/70">
          You don&apos;t have any trips booked yet. Explore our{" "}
          <Link
            href="/tours"
            className="underline underline-offset-2 text-highland-gold"
          >
            Outlandish tours
          </Link>{" "}
          to start planning your adventure.
        </p>
      )}

      {/* Upcoming trips */}
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-highland-ink">
            Upcoming trips
          </h2>
          {upcoming.map((booking) => {
            const tour = booking.tour;
            const total = booking.totalAmount;
            const paid = booking.amountPaid;
            const remaining = Math.max(total - paid, 0);

            const depositTarget = total * 0.5;
            const depositDue = Math.max(depositTarget - paid, 0);

            const isFullyPaid = remaining <= 0.01;
            const depositFullyMet = depositDue <= 0.01;

            const startDate = new Date(booking.startDate);
            const diffMs = startDate.getTime() - now.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            let countdownLabel = "";
            if (diffDays < 0) {
              countdownLabel = "Trip date has passed";
            } else if (diffDays === 0) {
              countdownLabel = "Starts today";
            } else if (diffDays === 1) {
              countdownLabel = "Starts in 1 day";
            } else {
              countdownLabel = `Starts in ${diffDays} days`;
            }

            const lastPaymentAt = booking.lastPaymentAt
              ? new Date(booking.lastPaymentAt)
              : null;

            const lastPaymentAmount = booking.lastPaymentAmount ?? 0;
            const lastPaymentType = booking.lastPaymentType as
              | "deposit"
              | "balance"
              | null;

            return (
              <article
                key={booking.id}
                className="border border-highland-stone rounded-3xl bg-highland-offwhite p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1 text-sm">
                  <p className="text-xs text-highland-ink/70 flex items-center gap-2">
                    {startDate.toLocaleDateString("en-GB")} · {booking.guests}{" "}
                    guest{booking.guests !== 1 && "s"}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-highland-stone/30 text-[10px] text-highland-ink/80">
                      {countdownLabel}
                    </span>
                  </p>
                  <p className="font-semibold text-highland-ink">
                    {tour.title}
                  </p>
                  <p className="text-xs text-highland-ink/70">
                    Status: {booking.status}
                  </p>
                  <p className="text-xs text-highland-ink/70">
                    Total: £{total.toFixed(2)} · Paid: £{paid.toFixed(2)} ·
                    Outstanding: £{remaining.toFixed(2)}
                  </p>

                  {lastPaymentAt && lastPaymentAmount > 0 && (
                    <p className="text-[11px] text-highland-ink/60">
                      Last payment: £{lastPaymentAmount.toFixed(2)}{" "}
                      {lastPaymentType === "deposit"
                        ? "(deposit)"
                        : lastPaymentType === "balance"
                        ? "(balance)"
                        : ""}{" "}
                      on{" "}
                      {lastPaymentAt.toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}

                  <Link
                    href={`/dashboard/bookings/${booking.id}`}
                    className="inline-flex items-center gap-1 text-[11px] text-highland-gold hover:underline"
                  >
                    View trip details
                  </Link>
                </div>

                <div className="flex flex-col items-stretch gap-2 text-xs min-w-[210px]">
                  {isFullyPaid ? (
                    <div className="inline-flex items-center justify-center rounded-full bg-green-600/10 border border-green-600/40 text-green-700 px-4 py-2">
                      Trip fully paid
                    </div>
                  ) : (
                    <>
                      {!depositFullyMet && remaining > 0 && (
                        <Link
                          href={`/dashboard/payment?bookingId=${booking.id}&mode=deposit`}
                          className="inline-flex items-center justify-center rounded-full bg-highland-gold text-highland-offwhite px-4 py-2 font-semibold hover:brightness-110"
                        >
                          Pay 50% deposit · £{depositDue.toFixed(2)}
                        </Link>
                      )}

                      {remaining > 0 && (
                        <Link
                          href={`/dashboard/payment?bookingId=${booking.id}&mode=balance`}
                          className="inline-flex items-center justify-center rounded-full border border-highland-stone text-highland-ink px-4 py-2 hover:border-highland-gold hover:text-highland-gold"
                        >
                          Pay balance · £{remaining.toFixed(2)}
                        </Link>
                      )}

                      <p className="text-[11px] text-highland-ink/60 text-center">
                        You can choose to pay a 50% deposit now or settle the
                        full remaining balance. Payment flow will be completed
                        on the next step.
                      </p>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Past trips */}
      {past.length > 0 && (
        <section className="space-y-3 pt-4">
          <h2 className="text-sm font-semibold text-highland-ink">
            Past trips
          </h2>
          {past.map((booking) => {
            const tour = booking.tour;
            const total = booking.totalAmount;
            const paid = booking.amountPaid;

            const startDate = new Date(booking.startDate);
            const diffMs = now.getTime() - startDate.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            let agoLabel = "";
            if (diffDays <= 0) {
              agoLabel = "Completed recently";
            } else if (diffDays === 1) {
              agoLabel = "Completed 1 day ago";
            } else {
              agoLabel = `Completed ${diffDays} days ago`;
            }

            return (
              <article
                key={booking.id}
                className="border border-highland-stone rounded-3xl bg-highland-offwhite/70 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between opacity-90"
              >
                <div className="space-y-1 text-sm">
                  <p className="text-xs text-highland-ink/70 flex items-center gap-2">
                    {startDate.toLocaleDateString("en-GB")} · {booking.guests}{" "}
                    guest{booking.guests !== 1 && "s"}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-highland-stone/30 text-[10px] text-highland-ink/80">
                      {agoLabel}
                    </span>
                  </p>
                  <p className="font-semibold text-highland-ink">
                    {tour.title}
                  </p>
                  <p className="text-xs text-highland-ink/70">
                    Status: {booking.status}
                  </p>
                  <p className="text-xs text-highland-ink/70">
                    Total paid: £{paid.toFixed(2)}
                  </p>

                  <Link
                    href={`/dashboard/bookings/${booking.id}`}
                    className="inline-flex items-center gap-1 text-[11px] text-highland-gold hover:underline"
                  >
                    View trip details
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}