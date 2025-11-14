// app/api/admin/guides/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: Request, { params }: RouteParams) {
  const guide = await prisma.guide.findUnique({
    where: { id: params.id },
  });

  if (!guide) {
    return NextResponse.json({ error: "Guide not found" }, { status: 404 });
  }

  return NextResponse.json(guide);
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, mobile, address } = body;

    const guide = await prisma.guide.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email,
        mobile: mobile || null,
        address: address || null,
      },
    });

    return NextResponse.json(guide);
  } catch (err: any) {
    console.error("Update guide error", err);
    return NextResponse.json(
      { error: "Failed to update guide" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    await prisma.guide.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Delete guide error", err);
    return NextResponse.json(
      { error: "Failed to delete guide" },
      { status: 500 }
    );
  }
}