// app/api/admin/tours/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteContext {
  params: { id: string };
}

// GET: fetch single tour by ID for admin use (optional)
export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tour = await prisma.tour.findUnique({
      where: { id: params.id }
    });

    if (!tour) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(tour);
  } catch (err: any) {
    console.error("Error fetching tour", err);
    return NextResponse.json(
      { error: "Failed to fetch tour" },
      { status: 500 }
    );
  }
}

// PUT: update tour + its extra options
export async function PUT(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

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
    extraOptionIds
  } = data || {};

  const cleanSlug = (slug || "").trim();

  if (!title || !cleanSlug) {
    return NextResponse.json(
      { error: "Title and slug are required" },
      { status: 400 }
    );
  }

  const extraIds: string[] = Array.isArray(extraOptionIds)
    ? extraOptionIds.filter((id: any) => typeof id === "string")
    : [];

  try {
    const ops: any[] = [];

    const tourUpdate = prisma.tour.update({
      where: { id: params.id },
      data: {
        title,
        slug: cleanSlug,
        summary: summary ?? "",
        description: description ?? "",
        durationDays: durationDays != null ? Number(durationDays) : undefined,
        pricePerPerson:
          pricePerPerson != null ? Number(pricePerPerson) : undefined,
        maxGroupSize:
          maxGroupSize != null ? Number(maxGroupSize) : undefined,
        heroImageUrl: heroImageUrl || null,
        isFeatured: typeof isFeatured === "boolean" ? isFeatured : undefined,
        isActive: typeof isActive === "boolean" ? isActive : undefined,
        options: Array.isArray(options) ? options : [],
        galleryImages: Array.isArray(galleryImages) ? galleryImages : []
      }
    });

    ops.push(tourUpdate);

    // Replace all extra options for this tour with the new set
    ops.push(
      prisma.tourExtraOption.deleteMany({
        where: { tourId: params.id }
      })
    );

    if (extraIds.length > 0) {
      ops.push(
        prisma.tourExtraOption.createMany({
          data: extraIds.map(extraId => ({
            tourId: params.id,
            extraOptionId: extraId
          })),
          skipDuplicates: true
        })
      );
    }

    const [tour] = await prisma.$transaction(ops);

    return NextResponse.json(tour);
  } catch (err: any) {
    console.error("Error updating tour", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Failed to update tour – check server logs for more details."
      },
      { status: 500 }
    );
  }
}

// DELETE: delete tour, but only if it has no bookings
export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookingCount = await prisma.booking.count({
      where: { tourId: params.id }
    });

    if (bookingCount > 0) {
      return NextResponse.json(
        {
          error:
            "This tour has existing bookings. Please delete those bookings first in Admin → Bookings before deleting the tour."
        },
        { status: 400 }
      );
    }

    await prisma.tour.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error deleting tour", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Failed to delete tour – check server logs for more details."
      },
      { status: 500 }
    );
  }
}