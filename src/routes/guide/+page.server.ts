// src/routes/guide/+page.server.ts
import type { PageServerLoad } from "./$types";
import { redirect, error } from "@sveltejs/kit";
import { supabase } from "$lib/server/supabaseClient";

function getGuideFromCookie(cookies: any) {
  const raw = cookies.get("outlandish_session");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (!parsed.isGuide) return null;

    return {
      id: parsed.id as string,
      email: parsed.email as string,
      name: parsed.name ?? null,
      isGuide: true
    };
  } catch (e) {
    console.error("GUIDE LAYOUT: failed to parse outlandish_session:", e);
    return null;
  }
}

export const load: PageServerLoad = async ({ cookies }) => {
  // 1) Ensure we have a logged-in guide
  const guideUser = getGuideFromCookie(cookies);

  if (!guideUser) {
    throw redirect(303, "/auth/login");
  }

  // 2) Look up the Guide row for this user
  const { data: guideRow, error: guideError } = await supabase
    .from("Guide")
    .select("*")
    .eq("userId", guideUser.id)
    .maybeSingle();

  if (guideError) {
    console.error("Error loading Guide for current user:", guideError);
    throw error(500, "Failed to load guide profile");
  }

  if (!guideRow) {
    // They are logged in *as a guide* but we don't have a Guide record
    throw error(404, "No guide profile found for this account.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  // 3) Load upcoming bookings for this guide
  const { data: upcoming, error: upcomingError } = await supabase
    .from("Booking")
    .select(
      `
      *,
      Tour:Tour(*),
      User:User(*)
    `
    )
    .eq("guideId", guideRow.id)
    .gte("startDate", todayIso)
    .order("startDate", { ascending: true });

  if (upcomingError) {
    console.error("Error loading upcoming bookings for guide:", upcomingError);
    throw error(500, "Failed to load upcoming bookings");
  }

  // 4) (Optional) Recent / past bookings
  const { data: past, error: pastError } = await supabase
    .from("Booking")
    .select(
      `
      *,
      Tour:Tour(*),
      User:User(*)
    `
    )
    .eq("guideId", guideRow.id)
    .lt("startDate", todayIso)
    .order("startDate", { ascending: false })
    .limit(20);

  if (pastError) {
    console.error("Error loading past bookings for guide:", pastError);
    throw error(500, "Failed to load past bookings");
  }

  return {
    guide: guideRow,
    upcomingBookings: upcoming ?? [],
    pastBookings: past ?? []
  };
};