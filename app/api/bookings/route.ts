// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ExtraChargeType } from "@prisma/client";

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

  const { tourId, startDate, guests, extraOptionIds } = body;

  if (!tourId || !startDate || !guests) {
    return NextResponse.json(
      { error: "tourId, startDate and guests are required" },
      { status: 400 }
    );
  }

  const guestCount = Number(guests);
  if (!Number.isFinite(guestCount) || guestCount < 1) {
    return NextResponse.json(
      { error: "Guests must be a positive number" },
      { status: 400 }
    );
  }

  const extraIds: string[] = Array.isArray(extraOptionIds)
    ? extraOptionIds.filter((id: any) => typeof id === "string")
    : [];

  try {
    const tour = await prisma.tour.findUnique({
      where: { id: tourId }
    });

    if (!tour || !tour.isActive) {
      return NextResponse.json(
        { error: "Tour not found or not available" },
        { status: 404 }
      );
    }

    // Load selected extras that are actually attached to this tour
    const attachedExtras = await prisma.tourExtraOption.findMany({
      where: {
        tourId,
        extraOptionId: { in: extraIds }
      },
      include: {
        extraOption: true
      }
    });

    // Base total: price per person × guests
    const baseTotal = tour.pricePerPerson * guestCount;

    // Compute extras totals + BookingExtraOption rows
    const extraLines = attachedExtras.map(({ extraOption }) => {
      const qty =
        extraOption.chargeType === ExtraChargeType.PER_PERSON
          ? guestCount
          : 1;

      const unitPrice = extraOption.price;
      const totalPrice = unitPrice * qty;

      return {
        extraOptionId: extraOption.id,
        quantity: qty,
        unitPrice,
        totalPrice
      };
    });

    const extrasTotal = extraLines.reduce(
      (sum, line) => sum + line.totalPrice,
      0
    );

    const totalAmount = baseTotal + extrasTotal;

    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json(
        { error: "Invalid startDate format" },
        { status: 400 }
      );
    }

    // Create booking + extras in a transaction
    const result = await prisma.$transaction(async tx => {
      const booking = await tx.booking.create({
        data: {
          tourId: tour.id,
          userId: (session.user as any).id,
          startDate: start,
          guests: guestCount,
          totalAmount,
          amountPaid: 0,
          status: "PENDING"
        }
      });

      if (extraLines.length > 0) {
        await tx.bookingExtraOption.createMany({
          data: extraLines.map(line => ({
            bookingId: booking.id,
            extraOptionId: line.extraOptionId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            totalPrice: line.totalPrice
          }))
        });
      }

      return booking;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error("Error creating booking", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Failed to create booking – please try again later."
      },
      { status: 500 }
    );
  }
}