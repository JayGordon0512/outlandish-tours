// src/routes/account/bookings/[id]/+page.server.ts
import type { PageServerLoad, Actions } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { supabase } from "$lib/server/supabaseClient";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "$env/static/private";

// Create a single Stripe client instance using SvelteKit env
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

// Minimum percentage of remaining balance a customer must pay
const MIN_BALANCE_PAYMENT_PERCENT = 20;

// --- helpers -----------------------------------------------------

function getCurrentUser(cookies: import("@sveltejs/kit").Cookies) {
  const raw = cookies.get("outlandish_session");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as {
      id: string;
      email: string;
      name: string | null;
      isAdmin?: boolean;
    };
  } catch {
    return null;
  }
}

function shortRef(id: string) {
  const clean = id.replace(/[^A-Za-z0-9]/g, "");
  const short = clean.slice(-6).toUpperCase();
  return `OT-${short}`;
}

// --- load --------------------------------------------------------

export const load: PageServerLoad = async ({ params, cookies }) => {
  const user = getCurrentUser(cookies);
  if (!user) {
    throw redirect(303, `/auth/login?redirect=/account/bookings/${params.id}`);
  }

  const bookingId = params.id;
  if (!bookingId) throw error(400, "Missing booking ID");

  const { data, error: bookingError } = await supabase
    .from("Booking")
    .select("*, Tour:Tour(*)")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError) {
    console.error("Error loading booking for account:", bookingError);
    throw error(500, "Failed to load booking");
  }

  if (!data) {
    throw error(404, "Booking not found");
  }

  // Authorisation: customer can only see their own booking
  if (data.userId !== user.id && !user.isAdmin) {
    throw error(403, "You do not have access to this booking");
  }

  const totalAmount = data.totalAmount ?? 0;
  const amountPaid = data.amountPaid ?? 0;
  const balanceRemaining = Math.max(0, totalAmount - amountPaid);

  const minPct =
    Number.isFinite(MIN_BALANCE_PAYMENT_PERCENT) && MIN_BALANCE_PAYMENT_PERCENT > 0
      ? MIN_BALANCE_PAYMENT_PERCENT
      : 20;

  const minPayment =
    balanceRemaining > 0
      ? Math.max(1, Math.round((balanceRemaining * minPct) / 100))
      : 0;

  return {
    booking: data,
    tour: data.Tour ?? null,
    shortRef: shortRef(data.id),
    balanceRemaining,
    minPayment
  };
};

// --- actions -----------------------------------------------------

export const actions: Actions = {
  /**
   * Update pickup location for this booking.
   * Returns { pickupSaved: true, pickupLocation } so the page
   * can show a "pickup saved" banner.
   */
  updatePickup: async ({ request, params, cookies }) => {
    const user = getCurrentUser(cookies);
    if (!user) {
      throw redirect(303, `/auth/login?redirect=/account/bookings/${params.id}`);
    }

    const bookingId = params.id;
    if (!bookingId) return fail(400, { pickupError: "Missing booking ID." });

    const formData = await request.formData();
    const pickupLocation =
      (formData.get("pickupLocation") as string | null)?.trim() ?? "";

    const fieldErrors: Record<string, string> = {};

    if (pickupLocation.length > 500) {
      fieldErrors.pickupLocation =
        "Pickup instructions are too long (max 500 characters).";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return fail(400, {
        error: "Please correct the highlighted fields.",
        fieldErrors,
        pickupLocation
      });
    }

    // Ensure booking belongs to this user (or admin)
    const { data: booking, error: bookingError } = await supabase
      .from("Booking")
      .select("userId")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      console.error("Error loading booking for pickup update:", bookingError);
      return fail(500, {
        error: "Could not update pickup location.",
        pickupLocation
      });
    }

    if (booking.userId !== user.id && !user.isAdmin) {
      return fail(403, {
        error: "You do not have permission to change this booking.",
        pickupLocation
      });
    }

    const { error: updateError } = await supabase
      .from("Booking")
      .update({
        pickupLocation: pickupLocation || null,
        updatedAt: new Date().toISOString()
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating pickup location:", updateError);
      return fail(500, {
        error: "Could not save pickup location.",
        pickupLocation
      });
    }

    return {
      pickupSaved: true,
      pickupLocation
    };
  },

  /**
   * Pay towards remaining balance.
   * Uses Stripe Checkout and existing webhook logic.
   * We set metadata.depositAmount so the webhook will
   * simply add to Booking.amountPaid.
   */
  payBalance: async ({ request, params, url, cookies }) => {
    const user = getCurrentUser(cookies);
    if (!user) {
      throw redirect(303, `/auth/login?redirect=/account/bookings/${params.id}`);
    }

    const bookingId = params.id;
    if (!bookingId) {
      return fail(400, { payError: "Missing booking ID." });
    }

    const formData = await request.formData();
    const amountRaw = (formData.get("amount") as string | null)?.trim() ?? "";
    const requestedAmount = Number(amountRaw);

    if (!amountRaw || !Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return fail(400, {
        payError: "Please enter a valid payment amount.",
        amount: amountRaw
      });
    }

    // Fetch booking to validate ownership and amounts
    const { data: booking, error: bookingError } = await supabase
      .from("Booking")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      console.error("Error loading booking for payBalance:", bookingError);
      return fail(500, { payError: "Could not load booking details." });
    }

    if (booking.userId !== user.id && !user.isAdmin) {
      return fail(403, { payError: "You do not have permission for this booking." });
    }

    const totalAmount = booking.totalAmount ?? 0;
    const amountPaid = booking.amountPaid ?? 0;
    const balanceRemaining = Math.max(0, totalAmount - amountPaid);

    if (balanceRemaining <= 0) {
      return fail(400, {
        payError: "This booking is already fully paid.",
        amount: amountRaw
      });
    }

   const minPayment = Math.max(
  1,
  Math.round((balanceRemaining * MIN_BALANCE_PAYMENT_PERCENT) / 100)
);

if (requestedAmount < minPayment) {
  return fail(400, {
    payError: `Minimum payment is £${minPayment}.`,
    amount: amountRaw
  });
}

// NEW: prevent overpayment instead of silently capping it
if (requestedAmount > balanceRemaining) {
  return fail(400, {
    payError: `You can only pay up to the remaining balance of £${balanceRemaining}.`,
    amount: amountRaw
  });
}

const amountToCharge = requestedAmount;
const amountInPence = Math.round(amountToCharge * 100);    const origin = process.env.PUBLIC_SITE_URL || url.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: booking.customerEmail ?? user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: amountInPence,
            product_data: {
              name: `Payment towards booking ${shortRef(booking.id)}`,
              description: `Balance payment for ${
                booking.startDate
                  ? new Date(booking.startDate).toLocaleDateString("en-GB")
                  : "your tour"
              }`
            }
          }
        }
      ],
      metadata: {
        bookingId,
        userId: booking.userId,
        // Reuse "depositAmount" so your existing Stripe webhook logic
        // just adds this to amountPaid.
        depositAmount: String(amountToCharge),
        paymentType: "balance"
      },
      success_url: `${origin}/account/bookings/${bookingId}?payment=success`,
      cancel_url: `${origin}/account/bookings/${bookingId}?payment=cancelled`
    });

    if (!session.url) {
      console.error("Stripe session created without URL:", session);
      return fail(500, { payError: "Failed to start payment session." });
    }

    throw redirect(303, session.url);
  }

  // Keep your existing requestCancel / undoCancel actions here if you have them
};