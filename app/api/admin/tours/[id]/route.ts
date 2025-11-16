// app/api/admin/tours/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as any;

  if (!session || !user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

// GET /api/admin/tours/[id] – fetch a single tour (for admin use)
export async function GET(
  _req: Request,
  context: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;
    if (!id) {
      return NextResponse.json({ error: "Missing tour id" }, { status: 400 });
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
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    return NextResponse.json({ tour });
  } catch (error) {
    console.error("GET /api/admin/tours/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tour" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/tours/[id] – update a tour
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;
    if (!id) {
      return NextResponse.json({ error: "Missing tour id" }, { status: 400 });
    }

    const body = await req.json();

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
    } = body ?? {};

    const updateData: any = {};

    if (typeof title === "string") updateData.title = title;
    if (typeof slug === "string") updateData.slug = slug;
    if (typeof summary === "string") updateData.summary = summary;
    if (typeof description === "string") updateData.description = description;
    if (typeof durationDays === "number") updateData.durationDays = durationDays;
    if (typeof pricePerPerson === "number")
      updateData.pricePerPerson = pricePerPerson;
    if (typeof maxGroupSize === "number") updateData.maxGroupSize = maxGroupSize;
    if (typeof heroImageUrl === "string") updateData.heroImageUrl = heroImageUrl;
    if (typeof isFeatured === "boolean") updateData.isFeatured = isFeatured;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    if (Array.isArray(options)) updateData.options = options;
    if (Array.isArray(galleryImages)) updateData.galleryImages = galleryImages;

    const updated = await prisma.tour.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, tour: updated });
  } catch (error) {
    console.error("PUT /api/admin/tours/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update tour" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tours/[id] – delete a tour
export async function DELETE(
  _req: Request,
  context: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;
    if (!id) {
      return NextResponse.json({ error: "Missing tour id" }, { status: 400 });
    }

    await prisma.tour.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/tours/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete tour (it may have related bookings)" },
      { status: 500 }
    );
  }
}