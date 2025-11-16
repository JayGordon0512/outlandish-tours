// app/api/tours/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/tours
 * Returns list of active tours with basic relations.
 */
export async function GET() {
  try {
    const tours = await prisma.tour.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        extraOptions: {
          include: { extraOption: true },
        },
      },
    });

    return NextResponse.json({ tours }, { status: 200 });
  } catch (err) {
    console.error("[TOURS_GET_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch tours" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tours
 * Creates a new tour. Used only by admin creation flow.
 */
export async function POST(req: NextRequest) {
  try {
    // Safe JSON parsing
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
      title,
      slug,
      summary,
      description,
      durationDays,
      pricePerPerson,
      maxGroupSize,
      heroImageUrl,
      galleryImages = [],
      extraOptionIds = [],
    } = body ?? {};

    // Minimal validation
    if (!title || !slug || !summary || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const tour = await prisma.tour.create({
      data: {
        title,
        slug,
        summary,
        description,
        durationDays: Number(durationDays ?? 1),
        pricePerPerson: Number(pricePerPerson ?? 0),
        maxGroupSize: Number(maxGroupSize ?? 1),
        heroImageUrl: heroImageUrl || null,
        galleryImages: Array.isArray(galleryImages)
          ? galleryImages
          : [],
        isFeatured: false,
        isActive: true,
        extraOptions: {
          create: extraOptionIds.map((id: string) => ({
            extraOptionId: id,
          })),
        },
      },
      include: {
        extraOptions: {
          include: { extraOption: true },
        },
      },
    });

    return NextResponse.json({ tour }, { status: 201 });
  } catch (err) {
    console.error("[TOURS_POST_ERROR]", err);

    return NextResponse.json(
      { error: "Failed to create tour" },
      { status: 500 }
    );
  }
}

/**
 * Block PATCH, PUT, DELETE to avoid Vercel build issues.
 */

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