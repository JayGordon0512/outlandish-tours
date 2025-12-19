// src/routes/api/stripe/webhook/+server.ts
import type { RequestHandler } from "@sveltejs/kit";
import Stripe from "stripe";
import { supabase } from "$lib/server/supabaseClient";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  console.warn("[Stripe Webhook] STRIPE_SECRET_KEY is not set.");
}

if (!webhookSecret) {
  console.warn("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set.");
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
  : null;

export const POST: RequestHandler = async ({ request }) => {
  if (!stripe || !webhookSecret) {
    console.error("[Stripe Webhook] Stripe not configured properly.");
    return new Response("Stripe not configured", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      console.error("[Stripe Webhook] Missing stripe-signature header");
      return new Response("Missing signature", { status: 400 });
    }

    // IMPORTANT: use raw body, not JSON
    const rawBody = await request.text();

    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("[Stripe Webhook] Error verifying signature:", err?.message || err);
    return new Response(`Webhook Error: ${err?.message ?? "Unknown error"}`, {
      status: 400
    });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata || {};
    console.log("[Stripe Webhook] checkout.session.completed metadata:", metadata);

    const bookingId = metadata.bookingId;
    const userId = metadata.userId;
    const tourId = metadata.tourId;
    const tourTitle = metadata.tourTitle;
    const slug = metadata.slug;
    const startDate = metadata.startDate;
    const guests = metadata.guests ? Number(metadata.guests) : null;
    const customerName = metadata.customerName || null;
    const customerEmail = metadata.customerEmail || null;
    const totalAmount = metadata.totalAmount ? Number(metadata.totalAmount) : null; // in £
    const depositAmount = metadata.depositAmount ? Number(metadata.depositAmount) : null; // in £
    const depositPercent = metadata.depositPercent ? Number(metadata.depositPercent) : null;
    const notes = metadata.notes || null;

    if (!bookingId || !userId || !tourId || !startDate || !guests || !totalAmount || !depositAmount) {
      console.error("[Stripe Webhook] Missing critical metadata, cannot create booking", {
        bookingId,
        userId,
        tourId,
        startDate,
        guests,
        totalAmount,
        depositAmount
      });
      return new Response("Missing booking metadata", { status: 400 });
    }

    try {
      // Upsert into your internal User table just in case (id should already exist)
      if (customerEmail) {
        const { error: userError } = await supabase
          .from("User")
          .upsert(
            {
              id: userId,
              email: customerEmail,
              name: customerName,
              updatedAt: new Date().toISOString()
            },
            { onConflict: "id" }
          );

        if (userError) {
          console.error("[Stripe Webhook] Error upserting User:", userError);
        }
      }

      // Insert Booking record
      const nowIso = new Date().toISOString();

      const { error: bookingError } = await supabase.from("Booking").insert({
        id: bookingId, // we generated this in /tours/[slug]/book
        userId,
        tourId,
        startDate: new Date(startDate).toISOString(),
        guests,
        totalAmount, // in £ as per your schema
        amountPaid: depositAmount, // deposit only
        status: "confirmed", // or "deposit_paid" if you want a separate state
        adminNotes: notes,
        guideId: null, // can be assigned later in admin
        createdAt: nowIso,
        updatedAt: nowIso
      });

      if (bookingError) {
        console.error("[Stripe Webhook] Error inserting Booking:", bookingError);
        return new Response("Failed to record booking", { status: 500 });
      }

      console.log("[Stripe Webhook] Booking created successfully:", {
        bookingId,
        userId,
        tourId
      });
    } catch (e) {
      console.error("[Stripe Webhook] Unexpected error:", e);
      return new Response("Internal error", { status: 500 });
    }
  } else {
    // For now we just log other events
    console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
  }

  return new Response("ok", { status: 200 });
};