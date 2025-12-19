// src/routes/admin/bookings/[id]/+page.server.ts
import type { PageServerLoad, Actions } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
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
    console.error("Failed to parse outlandish_session in admin bookings:", e);
    return null;
  }
}

export const load: PageServerLoad = async ({ params, cookies, url }) => {
  const admin = getAdminFromCookie(cookies);
  if (!admin) {
    throw redirect(303, "/auth/login");
  }

  const bookingId = params.id;
  if (!bookingId) {
    throw error(400, "Missing booking id");
  }

  const { data: booking, error: bookingError } = await supabase
    .from("Booking")
    .select(
      `
      *,
      Tour:Tour(*),
      User:User(*)
    `
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    console.error("Error loading booking for admin:", bookingError);
    throw error(500, "Failed to load booking");
  }

  if (!booking) {
    throw error(404, "Booking not found");
  }

  // Load all guides for the assignment dropdown
  const { data: guides, error: guidesError } = await supabase
    .from("Guide")
    .select("id, firstName, lastName, email, photoUrl")
    .order("firstName", { ascending: true });

  if (guidesError) {
    console.error("Error loading guides for admin bookings:", guidesError);
  }

  // Success flag when redirecting back after update
  const guideUpdated = url.searchParams.get("guideUpdated") === "1";

  return {
    admin,
    booking,
    guides: guides ?? [],
    guideUpdated
  };
};

export const actions: Actions = {
  updateNotes: async ({ params, request, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) {
      throw redirect(303, "/auth/login");
    }

    const bookingId = params.id;
    if (!bookingId) {
      return fail(400, { error: "Missing booking id" });
    }

    const formData = await request.formData();
    const adminNotes = (formData.get("adminNotes") as string | null) ?? "";

    const { error: updateError } = await supabase
      .from("Booking")
      .update({
        adminNotes,
        updatedAt: new Date().toISOString()
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating admin notes:", updateError);
      return fail(500, { error: "Could not update notes." });
    }

    throw redirect(303, `/admin/bookings/${bookingId}`);
  },

  approveCancellation: async ({ params, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) {
      throw redirect(303, "/auth/login");
    }

    const bookingId = params.id;
    if (!bookingId) {
      return fail(400, { error: "Missing booking id" });
    }

    const { data: booking, error: fetchError } = await supabase
      .from("Booking")
      .select("status, adminNotes")
      .eq("id", bookingId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching booking in approveCancellation:", fetchError);
      return fail(500, { error: "Could not approve cancellation." });
    }

    if (!booking) {
      return fail(404, { error: "Booking not found." });
    }

    if (booking.status !== "cancel_requested") {
      return fail(400, { error: "Booking is not awaiting cancellation." });
    }

    const nowIso = new Date().toISOString();
    const noteLine = `Cancelled by admin on ${new Date().toLocaleString("en-GB")}`;
    const newNotes = booking.adminNotes
      ? `${booking.adminNotes}\n${noteLine}`
      : noteLine;

    const { error: updateError } = await supabase
      .from("Booking")
      .update({
        status: "cancelled",
        adminNotes: newNotes,
        updatedAt: nowIso
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error setting booking cancelled:", updateError);
      return fail(500, { error: "Could not cancel booking." });
    }

    throw redirect(303, `/admin/bookings/${bookingId}`);
  },

  keepBooking: async ({ params, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) {
      throw redirect(303, "/auth/login");
    }

    const bookingId = params.id;
    if (!bookingId) {
      return fail(400, { error: "Missing booking id" });
    }

    const { data: booking, error: fetchError } = await supabase
      .from("Booking")
      .select("status, adminNotes")
      .eq("id", bookingId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching booking in keepBooking:", fetchError);
      return fail(500, { error: "Could not update booking." });
    }

    if (!booking) {
      return fail(404, { error: "Booking not found." });
    }

    if (booking.status !== "cancel_requested") {
      return fail(400, { error: "Booking is not in cancel_requested state." });
    }

    const nowIso = new Date().toISOString();
    const noteLine = `Cancellation request cleared by admin on ${new Date().toLocaleString(
      "en-GB"
    )}`;
    const newNotes = booking.adminNotes
      ? `${booking.adminNotes}\n${noteLine}`
      : noteLine;

    const { error: updateError } = await supabase
      .from("Booking")
      .update({
        status: "confirmed",
        adminNotes: newNotes,
        updatedAt: nowIso
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error clearing cancellation request:", updateError);
      return fail(500, { error: "Could not update booking status." });
    }

    throw redirect(303, `/admin/bookings/${bookingId}`);
  },

  assignGuide: async ({ params, request, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) {
      throw redirect(303, "/auth/login");
    }

    const bookingId = params.id;
    if (!bookingId) {
      return fail(400, { guideError: "Missing booking id." });
    }

    const formData = await request.formData();
    const rawGuideId = (formData.get("guideId") as string | null) ?? "";
    const guideId = rawGuideId.trim() === "" ? null : rawGuideId.trim();

    try {
      const { error: updateError } = await supabase
        .from("Booking")
        .update({
          guideId,
          updatedAt: new Date().toISOString()
        })
        .eq("id", bookingId);

      if (updateError) {
        console.error("Error assigning guide:", updateError);
        return fail(500, { guideError: "Failed to assign guide." });
      }

      throw redirect(303, `/admin/bookings/${bookingId}?guideUpdated=1`);
    } catch (e) {
      console.error("Unexpected error during guide assignment:", e);
      return fail(500, { guideError: "Failed to assign guide." });
    }
  }
};