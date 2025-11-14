// app/dashboard/payment/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PaymentPageClient } from "@/components/payments/PaymentPageClient";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function PaymentPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const userId = (session.user as any).id;

  const bookingId = Array.isArray(searchParams.bookingId)
    ? searchParams.bookingId[0]
    : searchParams.bookingId;

  const modeParam = Array.isArray(searchParams.mode)
    ? searchParams.mode[0]
    : searchParams.mode;

  if (!bookingId) {
    return notFound();
  }

  const mode = modeParam === "deposit" ? "deposit" : "balance";

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
      userId
    },
    include: {
      tour: true
    }
  });

  if (!booking) {
    return notFound();
  }

  const total = booking.totalAmount;
  const paid = booking.amountPaid;
  const remaining = Math.max(total - paid, 0);

  const depositTarget = total * 0.5;
  const depositDue = Math.max(depositTarget - paid, 0);

  let amountToPay = remaining;
  let label = "Pay remaining balance";

  if (mode === "deposit") {
    amountToPay = depositDue;
    label = "Pay 50% deposit";
  }

  // Guard against tiny rounding weirdness
  if (amountToPay <= 0.01 || remaining <= 0.01) {
    // Nothing meaningful left to pay
    redirect("/dashboard");
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-highland-ink">
          {label}
        </h1>
        <p className="text-sm text-highland-ink/70">
          Tour: {booking.tour.title}
        </p>
      </div>

      <PaymentPageClient
        bookingId={booking.id}
        mode={mode}
        total={total}
        paid={paid}
        remaining={remaining}
        amountToPay={amountToPay}
      />
    </div>
  );
}