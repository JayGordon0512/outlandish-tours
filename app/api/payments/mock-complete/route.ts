// app/api/payments/mock-complete/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { bookingId, mode } = body as {
    bookingId?: string;
    mode?: "deposit" | "balance";
  };

  if (!bookingId) {
    return NextResponse.json(
      { error: "bookingId is required" },
      { status: 400 }
    );
  }

  const userId = (session.user as any).id;

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
      userId
    }
  });

  if (!booking) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 }
    );
  }

  const total = booking.totalAmount;
  const paid = booking.amountPaid;
  const remaining = Math.max(total - paid, 0);
  const depositTarget = total * 0.5;
  const depositDue = Math.max(depositTarget - paid, 0);

  const modeSafe = mode === "deposit" ? "deposit" : "balance";

  let amountToPay = remaining;
  if (modeSafe === "deposit") {
    amountToPay = depositDue;
  }

  if (amountToPay <= 0.01 || remaining <= 0.01) {
    return NextResponse.json(
      { error: "No outstanding amount to pay for this booking." },
      { status: 400 }
    );
  }

  const newPaid = paid + amountToPay;

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      amountPaid: newPaid,
      status: newPaid + 0.01 >= total ? "CONFIRMED" : booking.status
    }
  });

  return NextResponse.json(
    {
      ok: true,
      booking: updated
    },
    { status: 200 }
  );
}