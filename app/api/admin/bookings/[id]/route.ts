// app/api/admin/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        tour: true,
        user: true,
        guide: true,
        extras: {
          include: {
            extraOption: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("GET /api/admin/bookings/[id] error", error);
    return NextResponse.json(
      { error: "Unable to fetch booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
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
    status,
    adminNotes,
    guideId,
    amountPaid,
  }: {
    status?: string;
    adminNotes?: string | null;
    guideId?: string | null;
    amountPaid?: number;
  } = body ?? {};

  try {
    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...(status !== undefined && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
        ...(guideId !== undefined && { guideId }),
        ...(amountPaid !== undefined && { amountPaid }),
      },
      include: {
        tour: true,
        user: true,
        guide: true,
        extras: {
          include: {
            extraOption: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/admin/bookings/[id] error", error);
    return NextResponse.json(
      { error: "Unable to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await prisma.booking.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/bookings/[id] error", error);
    return NextResponse.json(
      { error: "Unable to delete booking" },
      { status: 500 }
    );
  }
}