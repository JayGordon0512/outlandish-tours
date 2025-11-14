// app/api/admin/options/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const option = await prisma.extraOption.findUnique({
      where: { id: params.id }
    });

    if (!option) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(option);
  } catch (err: any) {
    console.error("Error fetching extra option", err);
    return NextResponse.json(
      { error: "Failed to fetch extra option." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const { name, description, price, chargeType, isActive } = data || {};

  if (!name || price == null || !chargeType) {
    return NextResponse.json(
      { error: "Name, price and charge type are required." },
      { status: 400 }
    );
  }

  if (!["PER_PERSON", "PER_TOUR"].includes(chargeType)) {
    return NextResponse.json(
      { error: "Invalid charge type." },
      { status: 400 }
    );
  }

  try {
    const option = await prisma.extraOption.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        price: Number(price),
        chargeType,
        isActive: !!isActive
      }
    });

    return NextResponse.json(option);
  } catch (err: any) {
    console.error("Error updating extra option", err);
    return NextResponse.json(
      { error: "Failed to update extra option." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.extraOption.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error deleting extra option", err);
    return NextResponse.json(
      { error: "Failed to delete extra option." },
      { status: 500 }
    );
  }
}