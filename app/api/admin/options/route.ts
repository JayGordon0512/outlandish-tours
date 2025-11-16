// app/api/admin/options/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/options
// Return all extra options
export async function GET() {
  try {
    const options = await prisma.extraOption.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error("Error fetching extra options:", error);
    return NextResponse.json(
      { error: "Failed to fetch extra options" },
      { status: 500 }
    );
  }
}

// POST /api/admin/options
// Create a new extra option
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      description,
      price,
      chargeType,
      isActive = true,
    } = body ?? {};

    if (!name || typeof price !== "number" || !chargeType) {
      return NextResponse.json(
        { error: "Missing required fields: name, price, chargeType" },
        { status: 400 }
      );
    }

    const option = await prisma.extraOption.create({
      data: {
        name,
        description: description ?? null,
        price,
        chargeType,
        isActive,
      },
    });

    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    console.error("Error creating extra option:", error);
    return NextResponse.json(
      { error: "Failed to create extra option" },
      { status: 500 }
    );
  }
}