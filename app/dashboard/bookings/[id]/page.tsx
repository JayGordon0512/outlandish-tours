// app/dashboard/bookings/[id]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface PageProps {
  params: { id: string };
}

export default async function BookingDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const userId = (session.user as any).id;
  const bookingId = params.id;

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
      userId,
    },
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
    return notFound();
  }

  const tour = booking.tour;
  const total = booking.totalAmount;
  const paid = booking.amountPaid;
  const remaining = Math.max(total - paid, 0);

  const lastPaymentAt = booking.lastPaymentAt
    ? new Date(booking.lastPaymentAt)
    : null;
  const lastPaymentAmount = booking.lastPaymentAmount ?? 0;
  const lastPaymentType = booking.lastPaymentType as
    | "deposit"
    | "balance"
    | null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-2">
        <p className="text-xs text-highland-ink/60">
          <Link
            href="/dashboard"
            className="underline underline-offset-2 text-highland-gold"
          >
            ← Back to My trips
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-highland-ink">
          Trip details
        </h1>
        <p className="text-sm text-highland-ink/70">
          {new Date(booking.startDate).toLocaleDateString("en-GB")} ·{" "}
          {booking.guests} guest{booking.guests !== 1 && "s"}
        </p>
      </header>

      <section className="grid md:grid-cols-[2fr,1.5fr] gap-5">
        <div className="space-y-3">
          <div className="border border-highland-stone rounded-2xl bg-highland-offwhite p-4 space-y-1 text-sm">
            <h2 className="text-base font-semibold text-highland-ink">
              {tour.title}
            </h2>
            <p className="text-xs text-highland-ink/70">
              Status: {booking.status}
            </p>
            <p className="text-xs text-highland-ink/70">
              Duration: {tour.durationDays} day
              {tour.durationDays !== 1 && "s"} · Max group {tour.maxGroupSize}
            </p>
          </div>

          <div className="border border-highland-stone rounded-2xl bg-highland-offwhite p-4 text-sm space-y-2">
            <h3 className="text-sm font-semibold text-highland-ink">
              Payment summary
            </h3>
            <p className="flex justify-between text-xs">
              <span className="text-highland-ink/70">Total tour cost</span>
              <span className="font-semibold text-highland-ink">
                £{total.toFixed(2)}
              </span>
            </p>
            <p className="flex justify-between text-xs">
              <span className="text-highland-ink/70">Paid so far</span>
              <span className="font-semibold text-highland-ink">
                £{paid.toFixed(2)}
              </span>
            </p>
            <p className="flex justify-between text-xs">
              <span className="text-highland-ink/70">Outstanding</span>
              <span className="font-semibold text-highland-ink">
                £{remaining.toFixed(2)}
              </span>
            </p>

            {lastPaymentAt && lastPaymentAmount > 0 && (
              <p className="text-[11px] text-highland-ink/60 pt-1">
                Last payment: £{lastPaymentAmount.toFixed(2)}{" "}
                {lastPaymentType === "deposit"
                  ? "(deposit)"
                  : lastPaymentType === "balance"
                  ? "(balance)"
                  : ""}
                {" on "}
                {lastPaymentAt.toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}

            {remaining > 0 && (
              <div className="pt-2 flex flex-col gap-2 text-xs">
                <Link
                  href={`/dashboard/payment?bookingId=${booking.id}&mode=deposit`}
                  className="inline-flex items-center justify-center rounded-full bg-highland-gold text-highland-offwhite px-4 py-2 font-semibold hover:brightness-110"
                >
                  Pay 50% deposit
                </Link>
                <Link
                  href={`/dashboard/payment?bookingId=${booking.id}&mode=balance`}
                  className="inline-flex items-center justify-center rounded-full border border-highland-stone text-highland-ink px-4 py-2 hover:border-highland-gold hover:text-highland-gold"
                >
                  Pay remaining balance
                </Link>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-3 text-sm">
          <div className="border border-highland-stone rounded-2xl bg-highland-offwhite p-4 space-y-2">
            <h3 className="text-sm font-semibold text-highland-ink">
              Extras on this booking
            </h3>
            {booking.extras.length === 0 ? (
              <p className="text-xs text-highland-ink/60">
                No paid extras were added to this booking. Your tour includes
                everything in the standard itinerary.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {booking.extras.map((be) => (
                  <li
                    key={be.id}
                    className="border border-highland-stone/70 rounded-xl px-3 py-2 bg-highland-stone/10"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-semibold text-highland-ink">
                        {be.extraOption.name}
                      </span>
                      <span className="font-semibold text-highland-gold">
                        £{be.extraOption.price.toFixed(2)}
                      </span>
                    </div>
                    {be.extraOption.chargeType === "PER_PERSON" && (
                      <p className="text-[11px] text-highland-ink/60">
                        Charged per person
                      </p>
                    )}
                    {be.extraOption.description && (
                      <p className="text-[11px] text-highland-ink/70 mt-0.5">
                        {be.extraOption.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border border-highland-stone rounded-2xl bg-highland-offwhite p-4 space-y-2 text-xs text-highland-ink/70">
            <h3 className="text-sm font-semibold text-highland-ink">
              Need to update your trip?
            </h3>
            <p>
              If you need to adjust your dates, guest count or extras, please
              contact us directly with your booking reference and we&apos;ll
              update things on your behalf.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}