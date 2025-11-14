// app/api/admin/guides/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, mobile, address } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name and email are required" },
        { status: 400 }
      );
    }

    const guide = await prisma.guide.create({
      data: {
        firstName,
        lastName,
        email,
        mobile: mobile || null,
        address: address || null,
      },
    });

    return NextResponse.json(guide);
  } catch (err: any) {
    console.error("Create guide error", err);
    return NextResponse.json(
      { error: "Failed to create guide" },
      { status: 500 }
    );
  }
}