// app/api/admin/image-suggestions/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "scottish highlands tour";

  console.log("Image suggestions requested for query:", query);

  // Static example images (you can swap these URLs for any photos you like)
  const results = [
    {
      id: "glencoe-1",
      thumb:
        "https://images.unsplash.com/photo-1521292270410-a8c53642e9d0?auto=format&fit=crop&w=600&q=80",
      full:
        "https://images.unsplash.com/photo-1521292270410-a8c53642e9d0?auto=format&fit=crop&w=1600&q=80"
    },
    {
      id: "castle-1",
      thumb:
        "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80",
      full:
        "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1600&q=80"
    },
    {
      id: "loch-1",
      thumb:
        "https://images.unsplash.com/photo-1508261306211-45a1c5c2a5c5?auto=format&fit=crop&w=600&q=80",
      full:
        "https://images.unsplash.com/photo-1508261306211-45a1c5c2a5c5?auto=format&fit=crop&w=1600&q=80"
    },
    {
      id: "road-1",
      thumb:
        "https://images.unsplash.com/photo-1513384312027-9fa69a360337?auto=format&fit=crop&w=600&q=80",
      full:
        "https://images.unsplash.com/photo-1513384312027-9fa69a360337?auto=format&fit=crop&w=1600&q=80"
    }
  ];

  return NextResponse.json({ results });
}