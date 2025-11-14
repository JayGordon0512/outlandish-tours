// app/admin/guides/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GuideForm } from "@/components/admin/GuideForm";

interface GuidePageProps {
  params: { id: string };
}

export default async function EditGuidePage({ params }: GuidePageProps) {
  const guide = await prisma.guide.findUnique({
    where: { id: params.id },
  });

  if (!guide) {
    return notFound();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-highland-ink">
        Edit guide: {guide.firstName} {guide.lastName}
      </h2>
      <GuideForm guide={guide} />
    </div>
  );
}