import { prisma } from "@/lib/prisma";
import { TourCard } from "@/components/TourCard";
import Link from "next/link";

export default async function HomePage() {
  const featured = await prisma.tour.findMany({
    where: { isActive: true, isFeatured: true },
    take: 3
  });

  return (
    <div className="space-y-12">
      <section className="grid md:grid-cols-[3fr,2fr] gap-10 items-center">
        <div className="space-y-5">
          <p className="text-xs tracking-[0.25em] uppercase text-highland-gold">
            Outlander-inspired • Story-led • Small group
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight text-highland-ink">
            Cinematic journeys through the{" "}
            <span className="text-highland-gold">Scottish Highlands</span>, crafted for
            Outlander fans and lovers of legend.
          </h1>
          <p className="text-sm md:text-base text-highland-ink/80">
            Outlandish Tours weaves filming locations, clan history and wild Highland
            landscapes into intimate, story-rich adventures. Follow in the footsteps of
            Jamie and Claire, or simply fall in love with the real Scotland behind the
            screen.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tours"
              className="px-5 py-2 rounded-full bg-highland-gold text-highland-offwhite text-sm font-semibold tracking-wide hover:brightness-110 transition"
            >
              Explore tours
            </Link>
            <Link
              href="/about"
              className="px-5 py-2 rounded-full border border-highland-stone text-sm text-highland-ink hover:border-highland-gold hover:text-highland-gold transition"
            >
              Why travel with us?
            </Link>
          </div>
          <p className="text-xs text-highland-ink/60">
            Flexible deposits · Secure online payments · Small groups only
          </p>
        </div>
        <div className="rounded-3xl border border-highland-stone bg-highland-stone/40 p-4">
          <div
            className="aspect-[4/5] rounded-2xl bg-cover bg-center shadow-lg"
            style={{
              backgroundImage:
                "url('https://placehold.co/900x1200?text=Highland+Landscape')"
            }}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-highland-ink">Featured journeys</h2>
          <Link href="/tours" className="text-xs text-highland-gold hover:underline">
            View all tours
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-sm text-highland-ink/60">
            No featured tours yet. Log into the admin area to add your first tour.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {featured.map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}