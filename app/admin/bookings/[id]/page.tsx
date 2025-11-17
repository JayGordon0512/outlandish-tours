// app/admin/bookings/[id]/page.tsx
import BookingDetailClient from "@/components/admin/BookingDetailClient";

export default function AdminBookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <BookingDetailClient bookingId={params.id} />;
}