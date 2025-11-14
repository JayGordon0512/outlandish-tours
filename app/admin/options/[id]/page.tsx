// app/admin/options/[id]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditOptionForm } from "@/components/admin/EditOptionForm";

interface PageProps {
  params: { id: string };
}

export default async function AdminEditOptionPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/auth/login");
  }

  const option = await prisma.extraOption.findUnique({
    where: { id: params.id }
  });

  if (!option) return notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-highland-ink">
          Edit option
        </h1>
        <p className="text-sm text-highland-ink/70">
          Update the details for this paid extra.
        </p>
      </div>

      <EditOptionForm option={option} />
    </div>
  );
}