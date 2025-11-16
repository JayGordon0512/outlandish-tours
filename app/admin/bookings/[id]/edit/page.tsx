// app/admin/bookings/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditBookingForm } from "@/components/admin/EditBookingForm";
import { DeleteBookingButton } from "@/components/admin/DeleteBookingButton";

async function getBooking(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      tour: true,
      user: true,
      guide: true,
      extras: {
        include: {
          extraOption: true,
        },
      },
    },
  });
}

export default async function EditBookingPage({
  params,
}: {
  params: { id: string };
}) {
  const booking = await getBooking(params.id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-highland-ink">
            Edit booking
          </h2>
          <p className="text-sm text-highland-ink/70">
            Booking for {booking.tour.title} on{" "}
            {booking.startDate.toLocaleDateString("en-GB")} — {booking.guests}{" "}
            guest{booking.guests !== 1 && "s"}.
          </p>
        </div>

        <DeleteBookingButton bookingId={booking.id} />
      </div>

      <EditBookingForm
        booking={{
          id: booking.id,
          status: booking.status,
          guests: booking.guests,
          startDate: booking.startDate,
          totalAmount: booking.totalAmount,
          amountPaid: booking.amountPaid,
          adminNotes: booking.adminNotes ?? "",
          tour: {
            title: booking.tour.title,
          },
          user: {
            email: booking.user?.email ?? "",
          },
          // NOTE: guide + extras removed here so TS matches BookingWithRelations
        }}
      />
    </div>
  );
}