// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/bookings
// Returns all bookings (admin or system usage)
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        tour: true,
        user: true,
        extras: {
          include: { extraOption: true },
        },
        guide: true,
      },
    });

    return NextResponse.json(bookings, { status: 200 });
  } catch (err) {
    console.error("[BOOKINGS_GET_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings
// Creates a booking — used by the booking flow
export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const {
      userId,
      tourId,
      startDate,
      guests,
      totalAmount,
      amountPaid,
      extras = [],
    } = body;

    if (!userId || !tourId || !startDate || !guests) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        tourId,
        startDate: new Date(startDate),
        guests: Number(guests),
        totalAmount: Number(totalAmount ?? 0),
        amountPaid: Number(amountPaid ?? 0),

        extras: {
          create: extras.map((e: any) => ({
            extraOptionId: e.extraOptionId,
            quantity: Number(e.quantity),
            unitPrice: Number(e.unitPrice),
            totalPrice: Number(e.totalPrice),
          })),
        },
      },
      include: {
        extras: true,
        tour: true,
        user: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    console.error("[BOOKINGS_POST_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}