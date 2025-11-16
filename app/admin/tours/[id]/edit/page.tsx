// app/admin/tours/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditTourForm } from "@/components/admin/EditTourForm";

async function getTour(id: string) {
  return prisma.tour.findUnique({
    where: { id },
    include: {
      extraOptions: true, // matches TourWithExtras shape
    },
  });
}

export default async function EditTourPage({
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

      {/* Pass the entire Prisma record exactly as EditTourForm expects */}
      <EditTourForm tour={tour} />
    </div>
  );
}