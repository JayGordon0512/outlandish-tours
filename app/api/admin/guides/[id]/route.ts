// app/api/admin/guides/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getUserRoleSafe() {
  try {
    const session = await auth();
    const user = session?.user as any | undefined;
    return user?.role ?? null;
  } catch (err) {
    console.error("auth() failed in /api/admin/guides/[id]:", err);
    return null;
  }
}

// GET /api/admin/guides/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const role = await getUserRoleSafe();
    if (role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const guide = await prisma.guide.findUnique({
      where: { id: params.id },
    });

    if (!guide) {
      return NextResponse.json(
        { error: "Guide not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(guide, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin/guides/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/guides/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      console.error("Invalid JSON in PUT /api/admin/guides/[id]:", err);
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

    const updated = await prisma.guide.update({
      where: { id: params.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        mobile: mobile ?? null,
        address: address ?? null,
        // ⚠ Only if Guide has imageUrl
        // imageUrl: imageUrl ?? null,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PUT /api/admin/guides/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/guides/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const role = await getUserRoleSafe();
    if (role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.guide.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/admin/guides/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}