import Link from "next/link";
import type { Tour } from "@prisma/client";

export function TourCard({ tour }: { tour: Tour }) {
  const hero = tour.heroImageUrl ?? "https://placehold.co/800x500?text=Outlandish+Tour";
  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group overflow-hidden rounded-xl border border-highland-stone bg-highland-offwhite hover:border-highland-gold hover:-translate-y-1 transition transform flex flex-col"
    >
      <div
        className="h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${hero})` }}
      />
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-1 group-hover:text-highland-gold text-highland-ink">
          {tour.title}
        </h3>
        <p className="text-sm text-highland-ink/80 line-clamp-3 mb-3">
          {tour.summary}
        </p>
        <div className="mt-auto flex items-center justify-between text-xs text-highland-ink/80">
          <span>{tour.durationDays} day tour</span>
          <span className="font-semibold text-highland-gold">
            From £{tour.pricePerPerson} pp
          </span>
        </div>
      </div>
    </Link>
  );
}