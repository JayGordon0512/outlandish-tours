// app/admin/bookings/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditBookingForm } from "@/components/admin/EditBookingForm";
import { DeleteBookingButton } from "@/components/admin/DeleteBookingButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: { id: string };
}

export default async function EditBookingPage({ params }: PageProps) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      tour: true,
      user: true,
      guide: true,
      extras: {
        include: {
          extraOption: true
        }
      }
    }
  });

  if (!booking) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-highland-ink">Edit booking</h2>
          <p className="text-sm text-highland-ink/70">
            Update guest details, notes and extras for this booking.
          </p>
        </div>

        <DeleteBookingButton bookingId={booking.id} />
      </div>

      {/* Pass the full booking (with tour, user, guide, extras) into the form */}
      <EditBookingForm booking={booking as any} />
    </div>
  );
}