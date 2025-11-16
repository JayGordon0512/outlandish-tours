// app/api/payments/mock-complete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Safe JSON parsing
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { bookingId, paymentType } = body ?? {};

    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing bookingId" },
        { status: 400 }
      );
    }

    // Must be either "deposit" or "balance"
    const type =
      paymentType === "balance" ? "balance" : "deposit";

    // Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tour: true,
        extras: { include: { extraOption: true } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Calculate totals
    const basePrice =
      booking.tour.pricePerPerson * booking.guests;

    const extrasTotal = booking.extras.reduce(
      (sum, e) => sum + e.totalPrice,
      0
    );

    const total = basePrice + extrasTotal;

    // Determine how much to add
    let updatedPaid = booking.amountPaid;

    if (type === "deposit") {
      updatedPaid += Math.floor(total * 0.5);
    } else {
      updatedPaid = total; // balance paid in full
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        amountPaid: updatedPaid,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        ok: true,
        bookingId: updated.id,
        amountPaid: updatedPaid,
        paymentType: type,
        message:
          type === "deposit"
            ? "Mock deposit payment completed"
            : "Mock full balance payment completed",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[MOCK_COMPLETE_PAYMENT_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to complete payment" },
      { status: 500 }
    );
  }
}