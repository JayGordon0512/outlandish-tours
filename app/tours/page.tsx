// app/tours/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ToursPage() {
  const tours = await prisma.tour.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-highland-ink/65">
          Outlander-inspired experiences
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-highland-ink">
          Our Outlandish tours
        </h1>
        <p className="text-sm text-highland-ink/75 max-w-2xl">
          Hand-crafted private tours across the Highlands, inspired by the world
          of Outlander. Choose a favourite or use these as a starting point for
          a custom itinerary.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        {tours.map(tour => (
          <article
            key={tour.id}
            className="border border-highland-stone rounded-3xl bg-highland-offwhite/80 overflow-hidden flex flex-col"
          >
            <div className="aspect-[4/3] bg-highland-stone/30 border-b border-highland-stone overflow-hidden">
              {tour.heroImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tour.heroImageUrl}
                  alt={tour.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-highland-ink/60">
                  Image coming soon
                </div>
              )}
            </div>
            <div className="p-4 space-y-3 flex-1 flex flex-col">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-highland-ink">
                  <Link href={`/tours/${tour.slug}`}>
                    {tour.title}
                  </Link>
                </h2>
                <p className="text-xs text-highland-ink/70 line-clamp-3">
                  {tour.summary}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-[11px] text-highland-ink/75">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-highland-stone/20 border border-highland-stone/70">
                  <span>Duration</span>
                  <span className="font-semibold text-highland-ink">
                    {tour.durationDays} day{tour.durationDays !== 1 && "s"}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-highland-stone/20 border border-highland-stone/70">
                  <span>From</span>
                  <span className="font-semibold text-highland-ink">
                    £{tour.pricePerPerson}
                    <span className="text-[10px] text-highland-ink/60 ml-1">
                      per person
                    </span>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-highland-stone/20 border border-highland-stone/70">
                  <span>Max group</span>
                  <span className="font-semibold text-highland-ink">
                    {tour.maxGroupSize}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 mt-auto">
                <Link
                  href={`/tours/${tour.slug}`}
                  className="text-[11px] text-highland-ink/70 hover:text-highland-gold"
                >
                  View details
                </Link>
                <Link
                  href={`/dashboard/book?tourId=${tour.id}`}
                  className="inline-flex items-center justify-center rounded-full bg-highland-gold text-highland-offwhite px-4 py-1.5 text-[11px] font-semibold hover:brightness-110"
                >
                  Book this tour
                </Link>
              </div>
            </div>
          </article>
        ))}

        {tours.length === 0 && (
          <p className="text-sm text-highland-ink/70">
            No tours are currently available. Please check back soon or contact us
            to plan a custom Outlandish itinerary.
          </p>
        )}
      </div>
    </div>
  );
}