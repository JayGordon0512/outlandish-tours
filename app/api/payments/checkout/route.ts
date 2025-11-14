// app/api/payments/checkout/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// You can customise this to use test/live based on NODE_ENV
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20" // use latest as per your stripe package
    })
  : null;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment."
      },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { bookingId, mode } = body as {
    bookingId?: string;
    mode?: "deposit" | "balance";
  };

  if (!bookingId) {
    return NextResponse.json(
      { error: "bookingId is required" },
      { status: 400 }
    );
  }

  const userId = (session.user as any).id;

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
      userId
    },
    include: {
      tour: true
    }
  });

  if (!booking) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 }
    );
  }

  const total = booking.totalAmount;
  const paid = booking.amountPaid;
  const remaining = Math.max(total - paid, 0);
  const depositTarget = total * 0.5;
  const depositDue = Math.max(depositTarget - paid, 0);

  const modeSafe = mode === "deposit" ? "deposit" : "balance";

  let amountToPay = remaining;
  let lineLabel = `Balance for ${booking.tour.title}`;
  if (modeSafe === "deposit") {
    amountToPay = depositDue;
    lineLabel = `50% deposit for ${booking.tour.title}`;
  }

  if (amountToPay <= 0.01 || remaining <= 0.01) {
    return NextResponse.json(
      { error: "No outstanding amount to pay for this booking." },
      { status: 400 }
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const sessionCheckout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: (session.user as any).email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            product_data: {
              name: lineLabel
            },
            unit_amount: Math.round(amountToPay * 100) // Stripe expects pence
          }
        }
      ],
      metadata: {
        bookingId: booking.id,
        mode: modeSafe
      },
      success_url: `${appUrl}/dashboard?payment=success`,
      cancel_url: `${appUrl}/dashboard/payment?bookingId=${booking.id}&mode=${modeSafe}`
    });

    return NextResponse.json({ url: sessionCheckout.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe checkout error", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Unable to start Stripe checkout. Check server logs for more details."
      },
      { status: 500 }
    );
  }
}