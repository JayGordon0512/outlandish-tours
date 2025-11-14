// app/api/admin/tours/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// (Optional) GET: list all tours for admin
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tours = await prisma.tour.findMany({
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(tours);
}

// POST: create a new tour
export async function POST(req: Request) {
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
    const tour = await prisma.tour.create({
      data: {
        title,
        slug,
        summary: summary || "",
        description: description || "",
        durationDays: Number(durationDays) || 1,
        pricePerPerson: Number(pricePerPerson) || 0,
        maxGroupSize: Number(maxGroupSize) || 1,
        heroImageUrl: heroImageUrl || null,
        options: Array.isArray(options) ? options : [],
        galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
        // isFeatured / isActive will use defaults unless provided
      }
    });

    return NextResponse.json(tour, { status: 201 });
  } catch (err: any) {
    console.error("Error creating tour", err);
    return NextResponse.json(
      { error: "Failed to create tour" },
      { status: 500 }
    );
  }
}