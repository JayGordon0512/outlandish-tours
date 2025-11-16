// app/api/payments/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Parse body safely
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { bookingId } = body;
    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing bookingId" },
        { status: 400 }
      );
    }

    // Fetch booking to confirm existence
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tour: true,
        extras: { include: { extraOption: true } }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Compute totals
    const basePrice =
      booking.tour.pricePerPerson * booking.guests;

    const extrasTotal = booking.extras.reduce(
      (sum, e) => sum + e.totalPrice,
      0
    );

    const total = basePrice + extrasTotal;

    // This is a MOCK "payment session" for now
    const response = {
      ok: true,
      checkoutSession: {
        mockSessionId: `mock_${booking.id}`,
        amount: total,
        currency: "gbp",
        successUrl: `/dashboard/bookings/${booking.id}?payment=success`,
        cancelUrl: `/dashboard/bookings/${booking.id}?payment=cancelled`,
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (err) {
    console.error("[CHECKOUT_ROUTE_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}