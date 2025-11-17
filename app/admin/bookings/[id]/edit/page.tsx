// app/admin/bookings/[id]/edit/page.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditBookingForm } from "@/components/admin/EditBookingForm";
import { DeleteBookingButton } from "@/components/admin/DeleteBookingButton";

interface PageProps {
  params: { id: string };
}

export default async function EditBookingPage({ params }: PageProps) {
  let booking: any = null;

  try {
    booking = (await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            slug: true,
            pricePerPerson: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        guide: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        extras: {
          include: {
            extraOption: true
          }
        }
      }
    })) as any;
  } catch (err) {
    console.error("Error loading booking for admin edit:", err);
    // If Prisma / DB fails at build-time on Vercel, bail out gracefully
    notFound();
  }

  if (!booking) {
    notFound();
  }

  // Safely shape the data for the form
  const initialData = {
    id: booking.id,
    tourId: booking.tourId,
    startDate: booking.startDate,
    guests: booking.guests,
    status: booking.status,
    adminNotes: booking.adminNotes ?? "",
    amountPaid: booking.amountPaid ?? 0,
    totalAmount: booking.totalAmount ?? 0,
    user: {
      email: booking.user?.email ?? "",
      name: booking.user?.name ?? ""
    },
    guide: booking.guide
      ? {
          id: booking.guide.id,
          firstName: booking.guide.firstName,
          lastName: booking.guide.lastName
        }
      : null,
    extras: Array.isArray(booking.extras)
      ? booking.extras.map((e: any) => ({
          id: e.id,
          extraOptionId: e.extraOptionId,
          name: e.extraOption?.name ?? "",
          quantity: e.quantity ?? 1,
          unitPrice: e.unitPrice ?? 0,
          totalPrice: e.totalPrice ?? 0
        }))
      : []
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-highland-ink">
          Edit booking
        </h2>
        <DeleteBookingButton bookingId={booking.id} />
      </div>

      <EditBookingForm booking={initialData} />
    </div>
  );
}