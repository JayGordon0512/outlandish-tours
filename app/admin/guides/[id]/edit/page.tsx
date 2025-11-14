// app/admin/guides/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditGuideForm } from "@/components/admin/EditGuideForm";

export default async function EditGuidePage({ params }: { params: { id: string } }) {
  const guide = await prisma.guide.findUnique({
    where: { id: params.id },
  });

  if (!guide) notFound();

  return (
    <main className="max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold text-highland-ink">Edit Guide</h1>
      <EditGuideForm guide={guide} />
    </main>
  );
}