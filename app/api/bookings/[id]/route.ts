// app/api/admin/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteContext {
  params: { id: string };
}

// DELETE: delete a single booking (admin only)
export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.booking.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error deleting booking", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Failed to delete booking – check server logs for more details."
      },
      { status: 500 }
    );
  }
}