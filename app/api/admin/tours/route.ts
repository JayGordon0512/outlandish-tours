// app/api/admin/tours/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Make sure this never gets statically pre-rendered in a way that blows up builds
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tours = await prisma.tour.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        extraOptions: {
          include: {
            extraOption: true,
          },
        },
      },
    });

    return NextResponse.json(tours);
  } catch (error) {
    console.error("[API /admin/tours GET] Error:", error);
    return NextResponse.json(
      { error: "Unable to load tours" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: any = null;

    try {
      body = await request.json();
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
      isFeatured,
      isActive,
      options,
      galleryImages,
      extraOptionIds,
    } = body ?? {};

    if (!title || !slug || !summary || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const created = await prisma.tour.create({
      data: {
        title,
        slug,
        summary,
        description,
        durationDays: Number(durationDays) || 1,
        pricePerPerson: Number(pricePerPerson) || 0,
        maxGroupSize: Number(maxGroupSize) || 0,
        heroImageUrl: heroImageUrl || null,
        isFeatured: Boolean(isFeatured),
        isActive: isActive === undefined ? true : Boolean(isActive),
        options: Array.isArray(options) ? options : [],
        galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
        extraOptions: Array.isArray(extraOptionIds)
          ? {
              create: extraOptionIds.map((extraId: string) => ({
                extraOption: { connect: { id: extraId } },
              })),
            }
          : undefined,
      },
      include: {
        extraOptions: {
          include: {
            extraOption: true,
          },
        },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[API /admin/tours POST] Error:", error);
    return NextResponse.json(
      { error: "Unable to create tour" },
      { status: 500 }
    );
  }
}