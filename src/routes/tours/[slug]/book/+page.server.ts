// src/routes/tours/[slug]/book/+page.server.ts
import type { PageServerLoad, Actions } from "./$types";
import { supabase } from "$lib/server/supabaseClient";
import { error, fail, redirect } from "@sveltejs/kit";
import Stripe from "stripe";
import crypto from "node:crypto";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const depositPercentEnv = process.env.DEPOSIT_PERCENT;
const siteUrlEnv = process.env.PUBLIC_SITE_URL;
const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
  : null;

const getDepositPercent = () => {
  const n = depositPercentEnv ? Number(depositPercentEnv) : 25;
  return Number.isFinite(n) && n > 0 && n < 100 ? n : 25;
};

async function loadTourExtraOptions(tourId: string) {
  // Join table -> list of option ids
  const { data: joinRows, error: joinErr } = await supabase
    .from("TourExtraOption")
    .select("extraOptionId")
    .eq("tourId", tourId);

  if (joinErr) {
    console.error("Error loading TourExtraOption:", joinErr);
    return [];
  }

  const optionIds = (joinRows ?? []).map((r: any) => r.extraOptionId).filter(Boolean);

  if (optionIds.length === 0) return [];

  const { data: opts, error: optErr } = await supabase
    .from("ExtraOption")
    .select("id,name,description,price,chargeType,isActive")
    .in("id", optionIds)
    .order("name", { ascending: true });

  if (optErr) {
    console.error("Error loading ExtraOption:", optErr);
    return [];
  }

  return (opts ?? []).filter((o: any) => o.isActive !== false);
}

export const load: PageServerLoad = async ({ params, url }) => {
  const { slug } = params;

  if (!slug) throw error(400, "Missing tour slug");

  const { data: tour, error: dbError } = await supabase
    .from("Tour")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (dbError) console.error("Error loading tour for booking:", dbError);
  if (!tour) throw error(404, "Tour not found");

  const extraOptions = await loadTourExtraOptions(tour.id);

  const depositPercent = getDepositPercent();
  const defaultGuests = 2;

  // Preview excludes extras until UI selects them
  const pricePerPerson = Number(tour.pricePerPerson) || 0;
  const totalAmountPreview = pricePerPerson * defaultGuests;
  const depositPreview = Math.round((totalAmountPreview * depositPercent) / 100);

  const cancelled = url.searchParams.get("cancelled") === "1";

  return {
    tour,
    extraOptions, // ✅ for the booking UI
    depositPercent,
    totalAmountPreview,
    depositPreview,
    cancelled
  };
};

export const actions: Actions = {
  default: async ({ request, url, params, fetch }) => {
    if (!stripe) {
      console.error("Stripe is not configured.");
      return fail(500, { error: "Payment system is not configured." });
    }

    const formData = await request.formData();

    const slug = params.slug;
    const tourId = (formData.get("tourId") as string | null) ?? "";
    const tourTitle = (formData.get("tourTitle") as string | null) ?? "";

    const name = (formData.get("name") as string | null)?.trim() || "";
    const email = (formData.get("email") as string | null)?.trim() || "";
    const password = (formData.get("password") as string | null) || "";
    const confirmPassword = (formData.get("confirmPassword") as string | null) || "";
    const startDate = (formData.get("startDate") as string | null)?.trim() || "";
    const guestsRaw = (formData.get("guests") as string | null)?.trim() || "";
    const notes = (formData.get("notes") as string | null)?.trim() || "";
    const guests = guestsRaw ? Number(guestsRaw) : 0;

    // ✅ Selected extras from booking UI (checkboxes)
    const selectedExtraOptionIds = formData.getAll("extraOptionIds").map(String).filter(Boolean);

    const captchaToken = formData.get("g-recaptcha-response") as string | null;

    const values = { name, email, startDate, guests, notes };

    const fieldErrors: Record<string, string> = {};
    if (!name) fieldErrors.name = "Please enter your name.";
    if (!email) fieldErrors.email = "Please enter your email.";
    if (!password) fieldErrors.password = "Please choose a password.";
    if (password && password.length < 8) fieldErrors.password = "Password should be at least 8 characters.";
    if (!confirmPassword) fieldErrors.confirmPassword = "Please confirm your password.";
    if (password && confirmPassword && password !== confirmPassword) fieldErrors.confirmPassword = "Passwords do not match.";
    if (!startDate) fieldErrors.startDate = "Please choose a date.";
    if (!guests || guests <= 0) fieldErrors.guests = "Please enter a valid number of guests.";
    if (!captchaToken) fieldErrors.captcha = "Captcha verification failed. Please try again.";

    if (Object.keys(fieldErrors).length > 0) {
      return fail(400, { error: "Please correct the highlighted fields.", fieldErrors, values });
    }

    // Verify reCAPTCHA
    if (recaptchaSecret) {
      try {
        const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: recaptchaSecret,
            response: captchaToken as string
          })
        });

        const result = await resp.json();
        if (!result.success) {
          return fail(400, {
            error: "Captcha verification failed. Please try again.",
            fieldErrors: { captcha: "Captcha verification failed." },
            values
          });
        }
      } catch (e) {
        console.error("Error verifying reCAPTCHA:", e);
        return fail(400, {
          error: "Captcha verification failed. Please try again.",
          fieldErrors: { captcha: "Captcha verification failed." },
          values
        });
      }
    } else {
      console.warn("RECAPTCHA_SECRET_KEY is not set — skipping captcha verification.");
    }

    if (!tourId || !slug) return fail(400, { error: "Missing tour information.", values });

    // Re-fetch tour to avoid trusting client pricing
    const { data: tour, error: dbError } = await supabase
      .from("Tour")
      .select("*")
      .eq("id", tourId)
      .maybeSingle();

    if (dbError || !tour) {
      console.error("Error reloading tour on booking:", dbError);
      return fail(500, { error: "Failed to load tour details.", values });
    }

    // ✅ Load allowed options for this tour (prevents tampering)
    const allowedOptions = await loadTourExtraOptions(tourId);
    const allowedIds = new Set(allowedOptions.map((o: any) => String(o.id)));

    const safeSelectedIds = selectedExtraOptionIds.filter((id) => allowedIds.has(String(id)));

    // Calculate extras total
    let extrasTotal = 0;
    const selectedOptionSummaries: string[] = [];

    for (const id of safeSelectedIds) {
      const opt = allowedOptions.find((o: any) => String(o.id) === String(id));
      if (!opt) continue;

      const price = Number(opt.price) || 0;
      if (opt.chargeType === "PER_PERSON") {
        extrasTotal += price * guests;
        selectedOptionSummaries.push(`${opt.name} (£${price} pp)`);
      } else {
        // PER_TOUR
        extrasTotal += price;
        selectedOptionSummaries.push(`${opt.name} (£${price} per tour)`);
      }
    }

    // 1) Create Supabase Auth user
    const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (createUserError) {
      console.error("Error creating auth user:", createUserError);

      let friendly = "Could not create your account. ";
      if (
        typeof createUserError.message === "string" &&
        createUserError.message.toLowerCase().includes("already")
      ) {
        friendly = "An account with this email already exists. Please log in with that account to book.";
      }

      return fail(400, { error: friendly, values });
    }

    const authUserId = createdUser?.user?.id;
    if (!authUserId) return fail(500, { error: "Account creation failed unexpectedly.", values });

    // 2) Upsert into User table
    try {
      await supabase.from("User").upsert(
        { id: authUserId, email, name, updatedAt: new Date().toISOString() },
        { onConflict: "id" }
      );
    } catch (e) {
      console.error("Error upserting into User table:", e);
    }

    // 3) Calculate totals & deposit (base + extras)
    const depositPercent = getDepositPercent();
    const pricePerPerson = Number(tour.pricePerPerson) || 0;

    const baseTotal = pricePerPerson * guests;
    const totalAmount = baseTotal + extrasTotal; // £
    const depositAmount = Math.round((totalAmount * depositPercent) / 100); // £

    if (totalAmount <= 0 || depositAmount <= 0) {
      return fail(400, { error: "Unable to calculate booking price. Please contact us.", values });
    }

    const depositAmountInPence = depositAmount * 100;
    const origin = siteUrlEnv || url.origin;
    const bookingId = crypto.randomUUID();

    const extrasDesc =
      safeSelectedIds.length > 0 ? `Extras: ${selectedOptionSummaries.join(", ")}` : "Extras: none";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: depositAmountInPence,
            product_data: {
              name: `Deposit for ${tourTitle || tour.title}`,
              description: `Tour date: ${startDate}, Guests: ${guests}. ${extrasDesc}`
            }
          }
        }
      ],
      metadata: {
        bookingId,
        userId: authUserId,
        tourId,
        tourTitle: tourTitle || tour.title,
        slug,
        startDate,
        guests: String(guests),
        customerName: name,
        customerEmail: email,
        baseTotal: String(baseTotal),
        extrasTotal: String(extrasTotal),
        totalAmount: String(totalAmount),
        depositAmount: String(depositAmount),
        depositPercent: String(depositPercent),
        selectedExtraOptionIds: safeSelectedIds.join(","),
        selectedExtras: selectedOptionSummaries.join(" | "),
        notes
      },
      success_url: `${origin}/booking/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/tours/${slug}/book?cancelled=1`
    });

    if (!session.url) {
      console.error("Stripe session created without URL", session);
      return fail(500, { error: "Failed to start payment session.", values });
    }

    throw redirect(303, session.url);
  }
};