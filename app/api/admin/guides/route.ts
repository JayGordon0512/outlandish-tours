// app/api/admin/guides/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Small helper to safely get the current user role
async function getUserRoleSafe() {
  try {
    const session = await auth();
    const user = session?.user as any | undefined;
    return user?.role ?? null;
  } catch (err) {
    console.error("auth() failed in /api/admin/guides:", err);
    return null;
  }
}

/**
 * GET /api/admin/guides
 * Returns the list of guides for the admin UI.
 */
export async function GET(_req: NextRequest) {
  try {
    const role = await getUserRoleSafe();
    if (role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const guides = await prisma.guide.findMany({
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });

    return NextResponse.json(guides, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin/guides error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/guides
 * Creates a new guide.
 */
export async function POST(req: NextRequest) {
  try {
    const role = await getUserRoleSafe();
    if (role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      console.error("Invalid JSON body in POST /api/admin/guides:", err);
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      mobile,
      address,
      imageUrl,
    } = body ?? {};

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "firstName, lastName and email are required" },
        { status: 400 }
      );
    }

    const newGuide = await prisma.guide.create({
      data: {
        firstName,
        lastName,
        email,
        mobile: mobile ?? null,
        address: address ?? null,
        // only set image if your Guide model has this field;
        // remove this line if it doesn't exist in the Prisma schema
        // imageUrl: imageUrl ?? null,
      },
    });

    return NextResponse.json(newGuide, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/guides error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}