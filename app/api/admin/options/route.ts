// app/api/admin/options/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Ensure this is always runtime-only and never statically analyzed
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/options  → list all extra options
export async function GET() {
  try {
    const options = await prisma.extraOption.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(options);
  } catch (err) {
    console.error("GET /api/admin/options error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/options  → create a new extra option
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      description,
      price,
      chargeType,
      isActive,
    } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const created = await prisma.extraOption.create({
      data: {
        name,
        description: description ?? null,
        price: typeof price === "number" ? price : 0,
        chargeType: chargeType ?? "PER_PERSON",
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/options error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}