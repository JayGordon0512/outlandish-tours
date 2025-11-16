import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force this to run only at runtime — never at build time
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/options/[id]
export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;

    const option = await prisma.extraOption.findUnique({
      where: { id },
    });

    if (!option) {
      return NextResponse.json(
        { error: "Extra option not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(option);
  } catch (err) {
    console.error("GET /api/admin/options/[id] error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/options/[id]
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const data = await req.json();

    const updated = await prisma.extraOption.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.chargeType && { chargeType: data.chargeType }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json(
        { error: "Extra option not found" },
        { status: 404 }
      );
    }

    console.error("PUT /api/admin/options/[id] error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/options/[id]
export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;

    await prisma.extraOption.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json(
        { error: "Extra option not found" },
        { status: 404 }
      );
    }

    console.error("DELETE /api/admin/options/[id] error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}