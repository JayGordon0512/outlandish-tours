// app/api/admin/tours/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteContext {
  params: { id: string };
}

// (Optional) GET: fetch single tour by ID for admin use
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

// PUT: update tour
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
    galleryImages
  } = data || {};

  if (!title || !slug) {
    return NextResponse.json(
      { error: "Title and slug are required" },
      { status: 400 }
    );
  }

  try {
    const tour = await prisma.tour.update({
      where: { id: params.id },
      data: {
        title,
        slug,
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

    return NextResponse.json(tour);
  } catch (err: any) {
    console.error("Error updating tour", err);
    return NextResponse.json(
      { error: "Failed to update tour" },
      { status: 500 }
    );
  }
}

// DELETE: delete tour
export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.tour.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error deleting tour", err);
    return NextResponse.json(
      { error: "Failed to delete tour" },
      { status: 500 }
    );
  }
}