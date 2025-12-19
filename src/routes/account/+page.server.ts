// src/routes/account/+page.server.ts
import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { supabase } from "$lib/server/supabaseClient";

function getUserFromCookie(cookies: import("@sveltejs/kit").Cookies) {
  const raw = cookies.get("outlandish_session");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as {
      id: string;
      email: string;
      name: string | null;
      isAdmin?: boolean;
    };
  } catch (e) {
    console.error("ACCOUNT load: failed to parse outlandish_session cookie", e);
    return null;
  }
}

export const load: PageServerLoad = async ({ cookies }) => {
  const user = getUserFromCookie(cookies);

  if (!user) {
    throw redirect(303, "/auth/login");
  }

  // Load bookings for this user, with joined Tour
  const { data, error } = await supabase
    .from("Booking")
    .select(
      `
      id,
      tourId,
      startDate,
      guests,
      totalAmount,
      amountPaid,
      status,
      pickupLocation,
      createdAt,
      updatedAt,
      Tour (
        title
      )
    `
    )
    .eq("userId", user.id)
    .order("startDate", { ascending: true });

  if (error) {
    console.error("Error loading customer bookings:", error);
    return {
      user,
      upcomingBookings: [],
      pastBookings: [],
      loadError: "Failed to load your trips."
    };
  }

  const now = new Date();

  const bookings = (data ?? []).map((row: any) => {
    return {
      id: row.id,
      tourId: row.tourId,
      tourTitle: row.Tour?.title ?? "Untitled tour",
      startDate: row.startDate,
      guests: row.guests,
      totalAmount: row.totalAmount,
      amountPaid: row.amountPaid,
      status: row.status,
      pickupLocation: row.pickupLocation,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  });

  const upcomingBookings = bookings.filter((b) => {
    if (!b.startDate) return false;
    const d = new Date(b.startDate);
    return !Number.isNaN(d.getTime()) && d >= now;
  });

  const pastBookings = bookings.filter((b) => {
    if (!b.startDate) return false;
    const d = new Date(b.startDate);
    return !Number.isNaN(d.getTime()) && d < now;
  });

  return {
    user,
    upcomingBookings,
    pastBookings,
    loadError: null
  };
};