// app/admin/bookings/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditBookingForm } from "@/components/admin/EditBookingForm";
import { DeleteBookingButton } from "@/components/admin/DeleteBookingButton";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditBookingPage({ params }: PageProps) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      tour: true,
      user: true,
      extras: {
        include: {
          extraOption: true,
        },
      },
      guide: true,
    },
  });

  if (!booking) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-highland-ink">
            Edit booking
          </h2>
          <p className="text-sm text-highland-ink/70">
            Update booking details, extras, guide assignment and admin notes.
          </p>
        </div>

        <DeleteBookingButton bookingId={booking.id} />
      </div>

      {/* Edit form */}
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
          // 👇 FIX: ensure a string, even if email is null
          user: {
            email: booking.user?.email ?? "",
          },
          extras: booking.extras.map((e) => ({
            id: e.id,
            name: e.extraOption.name,
            quantity: e.quantity,
            unitPrice: e.unitPrice,
            totalPrice: e.totalPrice,
          })),
          guideId: booking.guideId,
        }}
      />
    </div>
  );
}