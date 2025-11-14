import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditTourForm } from "@/components/admin/EditTourForm";

interface Props {
  params: { id: string };
}

export default async function EditTourPage({ params }: Props) {
  const tour = await prisma.tour.findUnique({ where: { id: params.id } });
  if (!tour) return notFound();

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-4 text-highland-ink">Edit tour</h2>
      <EditTourForm tour={tour} />
    </div>
  );
}