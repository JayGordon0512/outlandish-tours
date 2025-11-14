import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "scottish highlands";

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json(
      { error: "Unsplash access key not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&orientation=landscape&per_page=6`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`
        }
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Unsplash error:", res.status, text);
      return NextResponse.json(
        { error: "Failed to fetch image suggestions" },
        { status: 500 }
      );
    }

    const data = await res.json();
    const results =
      data.results?.map((item: any) => ({
        id: item.id,
        thumb: item.urls.small,
        full: item.urls.full || item.urls.regular
      })) ?? [];

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Unsplash fetch error", err);
    return NextResponse.json(
      { error: "Error contacting image provider" },
      { status: 500 }
    );
  }
}