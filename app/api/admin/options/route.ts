// app/api/admin/options/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const options = await prisma.extraOption.findMany({
    orderBy: { name: "asc" }
  });

  return NextResponse.json(options);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const { name, description, price, chargeType, isActive } = data || {};

  if (!name || price == null || !chargeType) {
    return NextResponse.json(
      { error: "Name, price and charge type are required." },
      { status: 400 }
    );
  }

  if (!["PER_PERSON", "PER_TOUR"].includes(chargeType)) {
    return NextResponse.json(
      { error: "Invalid charge type." },
      { status: 400 }
    );
  }

  try {
    const option = await prisma.extraOption.create({
      data: {
        name,
        description: description || null,
        price: Number(price),
        chargeType,
        isActive: typeof isActive === "boolean" ? isActive : true
      }
    });

    return NextResponse.json(option, { status: 201 });
  } catch (err: any) {
    console.error("Error creating extra option", err);
    return NextResponse.json(
      { error: "Failed to create extra option." },
      { status: 500 }
    );
  }
}