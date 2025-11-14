// app/admin/bookings/[id]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface PageProps {
  params: { id: string };
}

// Server action to handle the update
async function updateBooking(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/auth/login");
  }

  const bookingId = (formData.get("bookingId") as string | null) ?? "";
  const startDateStr = (formData.get("startDate") as string | null)?.trim() ?? "";
  const guestsStr = (formData.get("guests") as string | null)?.trim() ?? "";
  const statusStr = (formData.get("status") as string | null)?.trim() ?? "";

  if (!bookingId) {
    redirect("/admin/bookings");
  }

  const guests = Number(guestsStr || 0);
  if (!startDateStr || !guests || guests <= 0) {
    // In a full version we’d show validation errors; for now just bounce back
    redirect(`/admin/bookings/${bookingId}/edit`);
  }

  const startDate = new Date(startDateStr); // YYYY-MM-DD → Date

  // Cast status into your enum; if invalid, fall back to PENDING
  const allowedStatuses = ["PENDING", "CONFIRMED", "CANCELLED"] as const;
  const status =
    allowedStatuses.includes(statusStr as any) ? statusStr : "PENDING";

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      startDate,
      guests,
      status: status as any,
    },
  });

  redirect("/admin/bookings");
}

export default async function EditBookingPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/auth/login");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      tour: true,
      user: true,
    },
  });

  if (!booking) {
    notFound();
  }

  const startDate = new Date(booking.startDate);
  const startDateInput = startDate.toISOString().slice(0, 10); // YYYY-MM-DD

  const total = booking.totalAmount;
  const paid = booking.amountPaid;
  const remaining = Math.max(total - paid, 0);

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="text-xs text-highland-ink/60">
          <Link
            href="/admin/bookings"
            className="underline underline-offset-2 text-highland-gold"
          >
            ← Back to bookings
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-highland-ink">
          Edit booking
        </h1>
        <p className="text-sm text-highland-ink/70">
          {booking.tour.title} ·{" "}
          {booking.user?.email ?? "Unknown customer"}
        </p>
      </header>

      <div className="grid md:grid-cols-[2fr,1.5fr] gap-5">
        {/* Editable core booking fields */}
        <form
          action={updateBooking}
          className="border border-highland-stone rounded-2xl bg-highland-offwhite p-4 space-y-4 text-sm"
        >
          <input type="hidden" name="bookingId" value={booking.id} />

          <div className="space-y-1">
            <label
              htmlFor="startDate"
              className="block text-xs font-medium text-highland-ink"
            >
              Tour date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={startDateInput}
              className="w-full rounded-xl border border-highland-stone bg-highland-stone/10 px-3 py-2 text-sm text-highland-ink focus:outline-none focus:ring-1 focus:ring-highland-gold"
            />
            <p className="text-[11px] text-highland-ink/60">
              Update the scheduled date for this booking.
            </p>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="guests"
              className="block text-xs font-medium text-highland-ink"
            >
              Guests
            </label>
            <input
              id="guests"
              name="guests"
              type="number"
              min={1}
              defaultValue={booking.guests}
              className="w-full rounded-xl border border-highland-stone bg-highland-stone/10 px-3 py-2 text-sm text-highland-ink focus:outline-none focus:ring-1 focus:ring-highland-gold"
            />
            <p className="text-[11px] text-highland-ink/60">
              Adjust the number of guests traveling on this booking.
            </p>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="status"
              className="block text-xs font-medium text-highland-ink"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={booking.status as any}
              className="w-full rounded-xl border border-highland-stone bg-highland-stone/10 px-3 py-2 text-sm text-highland-ink focus:outline-none focus:ring-1 focus:ring-highland-gold"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <p className="text-[11px] text-highland-ink/60">
              Use this to manually confirm or cancel a booking.
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-highland-gold text-highland-offwhite px-5 py-2 text-xs font-semibold hover:brightness-110"
          >
            Save changes
          </button>
        </form>

        {/* Read-only summary / context */}
        <aside className="space-y-3 text-sm">
          <div className="border border-highland-stone rounded-2xl bg-highland-offwhite p-4 space-y-2">
            <h2 className="text-sm font-semibold text-highland-ink">
              Booking summary
            </h2>
            <p className="text-xs text-highland-ink/70">
              Booking ID: {booking.id}
            </p>
            <p className="text-xs text-highland-ink/70">
              Created:{" "}
              {new Date(booking.createdAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-xs text-highland-ink/70">
              Customer: {booking.user?.email ?? "Unknown"}
            </p>
            <p className="text-xs text-highland-ink/70">
              Tour: {booking.tour.title}
            </p>
          </div>

          <div className="border border-highland-stone rounded-2xl bg-highland-offwhite p-4 space-y-2 text-xs text-highland-ink/80">
            <h3 className="text-sm font-semibold text-highland-ink">
              Payment overview
            </h3>
            <p className="flex justify-between">
              <span>Total</span>
              <span className="font-semibold">£{total.toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              <span>Paid</span>
              <span className="font-semibold">£{paid.toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              <span>Outstanding</span>
              <span className="font-semibold">£{remaining.toFixed(2)}</span>
            </p>
            <p className="text-[11px] text-highland-ink/60 pt-1">
              To adjust amounts, you can either process a manual payment through
              the mock payment flow or extend this form later to edit payment
              details.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}