// src/routes/booking/complete/+page.server.ts
import type { PageServerLoad } from "./$types";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
  : null;

export const load: PageServerLoad = async ({ url }) => {
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return {
      sessionId: null,
      booking: null,
      error: "Missing session_id."
    };
  }

  let session: Stripe.Checkout.Session | null = null;
  let bookingMeta: any = null;

  if (!stripe) {
    console.warn("[Booking Complete] Stripe not configured, skipping session lookup.");
  } else {
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent"]
      });

      // Pull out the metadata we set in the booking step
      if (session?.metadata) {
        const m = session.metadata;
        bookingMeta = {
          bookingId: m.bookingId,
          tourTitle: m.tourTitle,
          startDate: m.startDate,
          guests: m.guests,
          customerName: m.customerName,
          customerEmail: m.customerEmail,
          totalAmount: m.totalAmount,
          depositAmount: m.depositAmount,
          depositPercent: m.depositPercent
        };
      }
    } catch (e: any) {
      console.error("[Booking Complete] Error fetching Stripe session:", e?.message || e);
      return {
        sessionId,
        booking: null,
        error: "We couldn't confirm your payment details, but your booking may still be recorded. Please contact us if in doubt."
      };
    }
  }

  return {
    sessionId,
    booking: bookingMeta,
    error: null
  };
};