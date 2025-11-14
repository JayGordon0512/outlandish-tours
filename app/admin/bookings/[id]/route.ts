// app/api/admin/bookings/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: body.status,
        guests: body.guests,
        amountPaid: body.amountPaid,
        totalAmount: body.totalAmount,
        adminNotes: body.adminNotes ?? null,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message ?? "Failed to update booking" },
      { status: 500 }
    );
  }
}