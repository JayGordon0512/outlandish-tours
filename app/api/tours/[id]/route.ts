
// app/api/tours/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params?: {
    id?: string;
  };
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const id = context.params?.id;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid tour id" },
        { status: 400 }
      );
    }

    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        extraOptions: {
          include: {
            extraOption: true,
          },
        },
      },
    });

    if (!tour) {
      return NextResponse.json(
        { error: "Tour not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ tour }, { status: 200 });
  } catch (err) {
    console.error("[API_TOUR_ID_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch tour" },
      { status: 500 }
    );
  }
}

// Explicitly block other methods so they can't crash during pre-render
export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}