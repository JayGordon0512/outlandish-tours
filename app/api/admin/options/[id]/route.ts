// app/api/admin/options/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: {
    id: string;
  };
};

// GET /api/admin/options/[id]
// Fetch a single extra option
export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    const option = await prisma.extraOption.findUnique({
      where: { id: params.id },
    });

    if (!option) {
      return NextResponse.json(
        { error: "Extra option not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(option);
  } catch (error) {
    console.error("Error fetching extra option:", error);
    return NextResponse.json(
      { error: "Failed to fetch extra option" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/options/[id]
// Update an extra option
export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const body = await req.json();

    const {
      name,
      description,
      price,
      chargeType,
      isActive,
    } = body ?? {};

    const option = await prisma.extraOption.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(price !== undefined ? { price } : {}),
        ...(chargeType !== undefined ? { chargeType } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });

    return NextResponse.json(option);
  } catch (error: any) {
    console.error("Error updating extra option:", error);

    // If Prisma throws because the record doesn't exist
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Extra option not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update extra option" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/options/[id]
// Delete an extra option
export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    await prisma.extraOption.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting extra option:", error);

    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Extra option not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete extra option" },
      { status: 500 }
    );
  }
}