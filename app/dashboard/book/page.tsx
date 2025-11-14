// app/dashboard/book/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BookingForm } from "@/components/booking/BookingForm";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function BookPage({ searchParams }: PageProps) {
  // 1) Work out the tourId from the URL
  const tourId = Array.isArray(searchParams.tourId)
    ? searchParams.tourId[0]
    : searchParams.tourId;

  if (!tourId) {
    return notFound();
  }

  // 2) Build a callback URL so we can send people back here after login
  const callbackUrl = `/dashboard/book?tourId=${encodeURIComponent(tourId)}`;

  // 3) Check auth *after* we know the callbackUrl
  const session = await auth();
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  // 4) Load the tour + extras
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    include: {
      extraOptions: {
        include: {
          extraOption: true
        }
      }
    }
  });

  if (!tour || !tour.isActive) {
    return notFound();
  }

  const extras = tour.extraOptions.map(te => te.extraOption);

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-highland-ink">
          Book: {tour.title}
        </h1>
        <p className="text-sm text-highland-ink/70">
          From £{tour.pricePerPerson} per person · Up to {tour.maxGroupSize} guests
        </p>
      </div>

      <BookingForm
        tour={{
          id: tour.id,
          title: tour.title,
          pricePerPerson: tour.pricePerPerson,
          maxGroupSize: tour.maxGroupSize
        }}
        extras={extras}
      />
    </div>
  );
}