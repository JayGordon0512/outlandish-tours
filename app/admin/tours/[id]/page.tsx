// app/admin/tours/[id]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditTourForm } from "@/components/admin/EditTourForm";

interface PageProps {
  params: { id: string };
}

export default async function AdminEditTourPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/auth/login");
  }

  const tour = await prisma.tour.findUnique({
    where: { id: params.id },
    include: {
      extraOptions: true // TourExtraOption[]
    }
  });

  if (!tour) return notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-highland-ink">
          Edit tour
        </h1>
        <p className="text-sm text-highland-ink/70">
          Update tour details, imagery, and paid extras.
        </p>
      </div>

      {/* extra options will be fetched client-side in the form */}
      {/* @ts-expect-error – extraOptions is included above */}
      <EditTourForm tour={tour} />
    </div>
  );
}