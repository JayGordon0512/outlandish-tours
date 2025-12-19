// src/routes/stripe/webhook/+server.ts
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import Stripe from "stripe";
import { env } from "$env/dynamic/private";
import { supabase } from "$lib/server/supabaseClient";

const stripeSecretKey = env.STRIPE_SECRET_KEY;
const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
  : null;

export const POST: RequestHandler = async ({ request }) => {
  if (!stripe || !webhookSecret) {
    console.error("Stripe or webhook secret not configured.");
    return new Response("Stripe not configured", { status: 500 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    console.error("Missing Stripe signature header");
    return new Response("Missing sig", { status: 400 });
  }

  let event: Stripe.Event;

  // Stripe requires the **raw body** (text), not parsed JSON
  const body = await request.text();

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("⚠️  Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // We only care (for now) about a successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const md = session.metadata || {};

    const bookingId = md.bookingId;
    const userId = md.userId;
    const tourId = md.tourId;
    const tourTitle = md.tourTitle;
    const startDateRaw = md.startDate;
    const guestsRaw = md.guests;
    const customerName = md.customerName;
    const customerEmail = md.customerEmail;
    const totalAmountRaw = md.totalAmount;
    const depositAmountRaw = md.depositAmount;
    const notes = md.notes;

    if (!bookingId || !userId || !tourId) {
      console.error("Missing required metadata on checkout.session.completed", md);
      return json({ received: true }); // don’t retry forever, just log
    }

    const guests = guestsRaw ? Number(guestsRaw) : null;
    const totalAmount = totalAmountRaw ? Number(totalAmountRaw) : null;   // in £
    const amountPaid = depositAmountRaw ? Number(depositAmountRaw) : null; // in £

    const nowIso = new Date().toISOString();

    let startDateIso: string | null = null;
    if (startDateRaw) {
      const d = new Date(startDateRaw);
      if (!Number.isNaN(d.getTime())) {
        startDateIso = d.toISOString();
      }
    }

    try {
      const { error: upsertError } = await supabase
        .from("Booking")
        .upsert(
          {
            id: bookingId,
            userId,
            tourId,
            startDate: startDateIso,
            guests,
            totalAmount,
            amountPaid,
            status: "confirmed",
            adminNotes: notes || null,
            createdAt: nowIso,
            updatedAt: nowIso,
            // guideId left null — can be assigned later in admin
          },
          { onConflict: "id" }
        );

      if (upsertError) {
        console.error("Error upserting Booking from webhook:", upsertError);
      } else {
        console.log(
          `Created/updated Booking ${bookingId} for tour "${tourTitle}" (${tourId})`
        );
      }
    } catch (e) {
      console.error("Unexpected error inserting Booking from webhook:", e);
    }
  } else {
    // You can log other event types here if needed
    // console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return json({ received: true });
};