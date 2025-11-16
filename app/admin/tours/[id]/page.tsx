// app/admin/tours/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditTourForm } from "@/components/admin/EditTourForm";

async function getTour(id: string) {
  return prisma.tour.findUnique({
    where: { id },
    include: {
      extraOptions: true, // Required for TourWithExtras
    },
  });
}

export default async function ViewTourPage({
  params,
}: {
  params: { id: string };
}) {
  const tour = await getTour(params.id);

  if (!tour) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-4 text-highland-ink">
        Edit tour
      </h2>

      <EditTourForm tour={tour} />
    </div>
  );
}