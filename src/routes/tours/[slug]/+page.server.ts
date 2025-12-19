import type { PageServerLoad } from "./$types";
import { supabase } from "$lib/server/supabaseClient";
import { error } from "@sveltejs/kit";

async function loadTourExtraOptions(tourId: string) {
  // Try common join column variants
  const joinAttempts: Array<{ tourCol: string; optCol: string }> = [
    { tourCol: "tourId", optCol: "extraOptionId" },
    { tourCol: "tour_id", optCol: "extra_option_id" },
    { tourCol: "tourId", optCol: "extra_option_id" },
    { tourCol: "tour_id", optCol: "extraOptionId" }
  ];

  let optionIds: string[] = [];

  for (const attempt of joinAttempts) {
    const { data: rows, error: err } = await supabase
      .from("TourExtraOption")
      .select(`${attempt.optCol}`)
      .eq(attempt.tourCol, tourId);

    if (err) {
      // Column mismatch will throw here – keep trying
      continue;
    }

    optionIds = (rows ?? [])
      .map((r: any) => r?.[attempt.optCol])
      .filter(Boolean)
      .map((x: any) => String(x));

    console.log(
      `[tour extras] join hit using (${attempt.tourCol}, ${attempt.optCol}) => ${optionIds.length} ids`
    );

    // If we got a valid query (no error), stop trying
    break;
  }

  console.log(`[tour extras] tourId=${tourId} optionIds=`, optionIds);

  if (optionIds.length === 0) return [];

  const { data: opts, error: optErr } = await supabase
    .from("ExtraOption")
    .select("id,name,description,price,chargeType,isActive")
    .in("id", optionIds)
    .order("name", { ascending: true });

  if (optErr) {
    console.error("[tour extras] ExtraOption load error:", optErr);
    return [];
  }

  const active = (opts ?? []).filter((o: any) => o.isActive !== false);
  console.log(`[tour extras] resolved ExtraOption rows=${active.length}`);

  return active;
}
export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;
  if (!slug) throw error(400, "Missing tour slug");

  const { data: tour, error: dbError } = await supabase
    .from("Tour")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (dbError) {
    console.error("Error loading tour:", dbError);
  }

  if (!tour) throw error(404, "Tour not found");

  const extraOptions = await loadTourExtraOptions(tour.id);

  return {
    tour,
    extraOptions
  };
};