import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminToursPage() {
  const tours = await prisma.tour.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-highland-ink">Tours</h2>
        <Link
          href="/admin/tours/new"
          className="px-4 py-1.5 rounded-full bg-highland-gold text-highland-offwhite text-xs font-semibold hover:brightness-110"
        >
          New tour
        </Link>
      </div>
      <div className="space-y-2">
        {tours.map(tour => (
          <div
            key={tour.id}
            className="border border-highland-stone rounded-2xl p-3 bg-highland-offwhite flex items-center justify-between text-sm"
          >
            <div>
              <p className="font-semibold text-highland-ink">{tour.title}</p>
              <p className="text-xs text-highland-ink/70">
                {tour.durationDays} days · £{tour.pricePerPerson}pp ·{" "}
                {tour.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <Link
              href={`/admin/tours/${tour.id}/edit`}
              className="text-xs px-3 py-1 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold"
            >
              Edit
            </Link>
          </div>
        ))}
        {tours.length === 0 && (
          <p className="text-sm text-highland-ink/70">No tours created yet.</p>
        )}
      </div>
    </div>
  );
}