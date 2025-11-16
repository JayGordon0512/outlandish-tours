// app/api/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id?: string };
}

// GET /api/bookings/[id]
// Fetch a single booking with tour + extras
export async function GET(_req: Request, context: RouteContext) {
  try {
    const id = context.params?.id;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Booking id is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        tour: true,
        extras: {
          include: { extraOption: true },
        },
        guide: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(booking, { status: 200 });
  } catch (err) {
    console.error("[BOOKING_ID_GET_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/[id]
// Lightweight, safe update handler – you can extend this later if needed.
export async function PATCH(req: Request, context: RouteContext) {
  try {
    const id = context.params?.id;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Booking id is required" },
        { status: 400 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (typeof body.status === "string") {
      updateData.status = body.status;
    }
    if (typeof body.adminNotes === "string") {
      updateData.adminNotes = body.adminNotes;
    }
    if (typeof body.amountPaid === "number") {
      updateData.amountPaid = body.amountPaid;
    }
    if (
      typeof body.guideId === "string" ||
      body.guideId === null
    ) {
      updateData.guideId = body.guideId;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("[BOOKING_ID_PATCH_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id]
export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const id = context.params?.id;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Booking id is required" },
        { status: 400 }
      );
    }

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error("[BOOKING_ID_DELETE_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}