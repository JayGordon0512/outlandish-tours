// app/admin/bookings/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditBookingForm } from "@/components/admin/EditBookingForm";
import { DeleteBookingButton } from "@/components/admin/DeleteBookingButton";

export default async function EditBookingPage({
  params,
}: {
  params: { id: string };
}) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      tour: true,
      user: true,
    },
  });

  if (!booking) return notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-highland-ink">
          Edit booking
        </h2>
        <DeleteBookingButton bookingId={booking.id} />
      </div>

      <EditBookingForm
        booking={{
          id: booking.id,
          status: booking.status,
          guests: booking.guests,
          amountPaid: booking.amountPaid,
          totalAmount: booking.totalAmount,
          adminNotes: booking.adminNotes,
          startDate: booking.startDate,
          tour: { title: booking.tour.title },
          user: { email: booking.user.email },
        }}
      />
    </div>
  );
}