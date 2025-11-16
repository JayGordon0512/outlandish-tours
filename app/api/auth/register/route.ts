// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Prevent static optimization on Vercel
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { name, email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || "",
        passwordHash,
        role: "CUSTOMER",
      },
    });

    return NextResponse.json(
      { success: true, userId: user.id },
      { status: 201 }
    );

  } catch (err) {
    console.error("[AUTH REGISTER ERROR]", err);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}