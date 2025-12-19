// src/routes/admin/bookings/+page.server.ts
import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { supabase } from "$lib/server/supabaseClient";

function getAdminFromCookie(cookies: any) {
  const raw = cookies.get("outlandish_session");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.isAdmin) return null;
    return {
      id: parsed.id as string,
      email: parsed.email as string,
      name: parsed.name ?? null,
      isAdmin: true
    };
  } catch (e) {
    console.error("Failed to parse outlandish_session in admin bookings list:", e);
    return null;
  }
}

export const load: PageServerLoad = async ({ cookies, url }) => {
  const admin = getAdminFromCookie(cookies);
  if (!admin) {
    throw redirect(303, "/auth/login");
  }

  const guideFilter = url.searchParams.get("guideId") || "all";

  // Load guides for filter dropdown
  const { data: guides, error: guidesError } = await supabase
    .from("Guide")
    .select("id, firstName, lastName, isActive")
    .order("firstName", { ascending: true });

  if (guidesError) {
    console.error("Error loading guides for bookings filter:", guidesError);
  }

  // Base booking query
  let query = supabase
    .from("Booking")
    .select(
      `
      *,
      Tour:Tour(id, title),
      User:User(id, name, email),
      Guide:Guide(id, firstName, lastName)
    `
    )
    .order("createdAt", { ascending: false });

  if (guideFilter !== "all" && guideFilter) {
    query = query.eq("guideId", guideFilter);
  }

  const { data: bookings, error: bookingsError } = await query;

  if (bookingsError) {
    console.error("Error loading bookings for admin list:", bookingsError);
  }

  return {
    admin,
    bookings: bookings ?? [],
    guides: guides ?? [],
    guideFilter,
    error: bookingsError ? bookingsError.message : null
  };
};