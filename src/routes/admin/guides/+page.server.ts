
// src/routes/admin/guides/+page.server.ts
import type { PageServerLoad, Actions } from "./$types";
import { redirect, fail } from "@sveltejs/kit";
import { supabase } from "$lib/server/supabaseClient";

// Re-use the same admin check pattern as other admin pages
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
    console.error("Failed to parse outlandish_session in admin guides:", e);
    return null;
  }
}

export const load: PageServerLoad = async ({ cookies }) => {
  const admin = getAdminFromCookie(cookies);
  if (!admin) {
    throw redirect(303, "/auth/login");
  }

  // 1) Load all guides
  const { data: guides, error: guidesError } = await supabase
    .from("Guide")
    .select("id, firstName, lastName, email, mobile, address, photoUrl, isActive")
    .order("firstName", { ascending: true });

  if (guidesError) {
    console.error("Error loading guides:", guidesError);
  }

  // 2) Load bookings for upcoming-counts
  // We count bookings that:
  //   - have a guideId
  //   - are not cancelled
  //   - have a startDate in the future (or today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const { data: bookingsForCounts, error: bookingsError } = await supabase
    .from("Booking")
    .select("id, guideId, startDate, createdAt, status")
    .not("guideId", "is", null); // only rows that actually have a guide

  if (bookingsError) {
    console.error("Error loading bookings for guide counts:", bookingsError);
  }

  const bookingCounts: Record<string, number> = {};

  if (bookingsForCounts) {
    for (const b of bookingsForCounts) {
      const guideId = b.guideId as string | null;
      if (!guideId) continue;

      const status = (b.status as string | null) ?? "pending";
      if (status === "cancelled") continue; // don't count cancelled bookings

      const dateStr = (b.startDate as string | null) ?? (b.createdAt as string | null);
      if (!dateStr) continue;

      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) continue;

      // only count today or future
      if (d < today) continue;

      bookingCounts[guideId] = (bookingCounts[guideId] ?? 0) + 1;
    }
  }

  return {
    admin,
    guides: guides ?? [],
    bookingCounts,
    error: guidesError ? guidesError.message : null
  };
};

export const actions: Actions = {
  toggleActive: async ({ request, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) {
      throw redirect(303, "/auth/login");
    }

    const formData = await request.formData();
    const id = (formData.get("id") as string | null) ?? "";
    const currentRaw = (formData.get("current") as string | null) ?? "";

    if (!id) {
      return fail(400, { error: "Missing guide id" });
    }

    const current = currentRaw === "true";
    const next = !current;

    const { error: updateError } = await supabase
      .from("Guide")
      .update({
        isActive: next,
        updatedAt: new Date().toISOString()
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error toggling guide active state:", updateError);
      return fail(500, { error: "Could not update guide status." });
    }

    throw redirect(303, "/admin/guides");
  },

  deleteGuide: async ({ request, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) {
      throw redirect(303, "/auth/login");
    }

    const formData = await request.formData();
    const id = (formData.get("id") as string | null) ?? "";

    if (!id) {
      return fail(400, { error: "Missing guide id" });
    }

    // First, detach guide from any bookings (to avoid FK issues)
    const { error: detachError } = await supabase
      .from("Booking")
      .update({
        guideId: null,
        updatedAt: new Date().toISOString()
      })
      .eq("guideId", id);

    if (detachError) {
      console.error("Error detaching guide from bookings:", detachError);
      return fail(500, { error: "Could not detach guide from bookings." });
    }

    // Then delete the guide
    const { error: deleteError } = await supabase
      .from("Guide")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting guide:", deleteError);
      return fail(500, { error: "Could not delete guide." });
    }

    throw redirect(303, "/admin/guides");
  }
};