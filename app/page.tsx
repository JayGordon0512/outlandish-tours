// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const tours = await prisma.tour.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen">
      {/* FULL-WIDTH HERO */}
      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[420px] md:h-[560px] overflow-hidden">
        <Image
          src="/images/outlandish-hero-kilt.jpg"
          alt="Explorer in a kilt looking over the Scottish Highlands"
          fill
          priority
          className="object-cover"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Hero content */}
        <div className="absolute inset-0 flex items-center px-6 md:px-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-semibold text-highland-offwhite drop-shadow-lg">
              Outlandish Tours
            </h1>
            <p className="mt-4 text-highland-offwhite/90 text-sm md:text-lg max-w-xl drop-shadow">
              Bespoke Outlander &amp; Highland adventures, crafted in the heart
              of Scotland. Follow in the footsteps of legends across rugged
              moors, ancient castles and dramatic glens.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/tours"
                className="inline-block px-6 py-3 text-sm rounded-full bg-highland-gold text-highland-offwhite font-semibold hover:brightness-110 transition"
              >
                Explore All Tours
              </Link>
              <Link
                href="#tours-list"
                className="inline-block px-6 py-3 text-sm rounded-full border border-highland-offwhite/70 text-highland-offwhite hover:bg-highland-offwhite/10 transition"
              >
                View Upcoming Adventures
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        {/* Intro / value props */}
        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-semibold text-highland-ink">
            Crafted Highland &amp; Outlander Experiences
          </h2>
          <p className="text-sm md:text-base text-highland-ink/80">
            Every Outlandish tour is small-group, story-driven and curated
            personally from Scotland. Whether you&apos;re a devoted Outlander
            fan or simply in love with wild landscapes, we build days you&apos;ll
            talk about for years.
          </p>
        </section>

{/* TOURS LIST */}
<section id="tours-list" className="space-y-4">
  <div className="flex items-center justify-between gap-2">
    <h3 className="text-lg md:text-xl font-semibold text-highland-ink">
      Our Tours
    </h3>
    <Link
      href="/tours"
      className="text-xs md:text-sm text-highland-ink/70 hover:text-highland-gold"
    >
      View all tours →
    </Link>
  </div>

  {tours.length === 0 ? (
    <p className="text-sm text-highland-ink/70">
      No tours available yet. Check back soon!
    </p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {tours.map((tour) => (
        <Link
          key={tour.id}
          href={`/tours/${tour.slug}`}
          className="group border border-highland-stone rounded-2xl overflow-hidden bg-highland-offwhite hover:border-highland-gold transition"
        >
          {/* Thumbnail */}
          <div className="relative h-48 w-full bg-highland-stone/30">
            <Image
              src={tour.heroImageUrl || "/images/default-tour-placeholder.jpg"}
              alt={tour.title}
              fill
              className="object-cover"
            />
            {tour.isFeatured && (
              <span className="absolute top-2 left-2 rounded-full bg-highland-gold text-[10px] font-semibold px-2 py-1 text-highland-offwhite shadow">
                Featured
              </span>
            )}
          </div>

          {/* Text content */}
          <div className="p-4 space-y-2">
            <h4 className="font-semibold text-sm md:text-base text-highland-ink group-hover:text-highland-gold transition">
              {tour.title}
            </h4>

            {tour.summary && (
              <p className="text-xs text-highland-ink/70 line-clamp-3">
                {tour.summary}
              </p>
            )}

            <div className="flex items-center justify-between text-[11px] mt-2 text-highland-ink/70">
              <span>{tour.durationDays} day{tour.durationDays !== 1 && "s"}</span>
              <span>From £{tour.pricePerPerson}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )}
</section>
      </div>
    </main>
  );
}