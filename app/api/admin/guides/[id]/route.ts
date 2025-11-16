// app/api/admin/guides/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

// GET a single guide (with optional related info)
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const guide = await prisma.guide.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        bookings: {
          include: {
            tour: true,
          },
        },
      },
    });

    if (!guide) {
      return NextResponse.json(
        { error: "Guide not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(guide);
  } catch (error) {
    console.error("GET /api/admin/guides/[id] error", error);
    return NextResponse.json(
      { error: "Unable to fetch guide" },
      { status: 500 }
    );
  }
}

// PATCH – update guide details
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
    firstName,
    lastName,
    email,
    mobile,
    address,
    userId,
  }: {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
    address?: string;
    userId?: string | null;
  } = body ?? {};

  try {
    const updated = await prisma.guide.update({
      where: { id: params.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(mobile !== undefined && { mobile }),
        ...(address !== undefined && { address }),
        ...(userId !== undefined && { userId }),
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/admin/guides/[id] error", error);
    return NextResponse.json(
      { error: "Unable to update guide" },
      { status: 500 }
    );
  }
}

// DELETE – remove a guide
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await prisma.guide.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/guides/[id] error", error);
    return NextResponse.json(
      { error: "Unable to delete guide" },
      { status: 500 }
    );
  }
}