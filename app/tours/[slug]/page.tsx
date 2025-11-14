// app/tours/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: { slug: string };
}

export default async function TourPage({ params }: PageProps) {
  const tour = await prisma.tour.findUnique({
    where: { slug: params.slug },
    include: {
      extraOptions: {
        include: {
          extraOption: true
        }
      }
    }
  });

  if (!tour || !tour.isActive) {
    return notFound();
  }

  const extras = tour.extraOptions.map(te => te.extraOption);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero section */}
      <section className="grid md:grid-cols-[3fr,2fr] gap-6 items-start">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-highland-ink/70">
            Outlander-inspired private tour
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-highland-ink">
            {tour.title}
          </h1>
          <p className="text-sm text-highland-ink/75 leading-relaxed">
            {tour.summary}
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-highland-ink/80">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-highland-stone/20 border border-highland-stone/70">
              <span className="text-[11px]">Duration</span>
              <span className="font-semibold text-highland-ink">
                {tour.durationDays} day{tour.durationDays !== 1 && "s"}
              </span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-highland-stone/20 border border-highland-stone/70">
              <span className="text-[11px]">From</span>
              <span className="font-semibold text-highland-ink">
                £{tour.pricePerPerson}{" "}
                <span className="text-[11px] text-highland-ink/65">
                  per person
                </span>
              </span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-highland-stone/20 border border-highland-stone/70">
              <span className="text-[11px]">Max group</span>
              <span className="font-semibold text-highland-ink">
                {tour.maxGroupSize}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dashboard/book?tourId=${tour.id}`}
              className="inline-flex items-center justify-center rounded-full bg-highland-gold text-highland-offwhite px-6 py-2.5 text-xs font-semibold hover:brightness-110"
            >
              Book this tour
            </Link>
            <a
              href="#itinerary"
              className="inline-flex items-center justify-center rounded-full border border-highland-stone text-highland-ink px-6 py-2.5 text-xs font-semibold hover:border-highland-gold hover:text-highland-gold"
            >
              View full itinerary
            </a>
          </div>
        </div>

        {/* Hero image / gallery */}
        <div className="space-y-3">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-highland-stone bg-highland-stone/30">
            {tour.heroImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tour.heroImageUrl}
                alt={tour.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-highland-ink/60">
                Hero image coming soon
              </div>
            )}
          </div>
          {tour.galleryImages && tour.galleryImages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tour.galleryImages.map(url => (
                <div
                  key={url}
                  className="min-w-[120px] aspect-[4/3] rounded-2xl overflow-hidden border border-highland-stone bg-highland-stone/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${tour.title} photo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Itinerary / description */}
      <section id="itinerary" className="grid md:grid-cols-[3fr,2fr] gap-8">
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-highland-ink">
            Itinerary &amp; experience
          </h2>
          <div className="prose prose-sm max-w-none text-highland-ink/80 prose-headings:text-highland-ink prose-strong:text-highland-ink">
            {tour.description.split("\n\n").map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>

        {/* Sidebar: pricing summary + extras */}
        <aside className="space-y-4">
          <div className="border border-highland-stone rounded-2xl bg-highland-stone/10 p-4 space-y-2 text-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-highland-ink/80">From</span>
              <span className="text-lg font-semibold text-highland-ink">
                £{tour.pricePerPerson}{" "}
                <span className="text-[11px] font-normal text-highland-ink/65">
                  per person
                </span>
              </span>
            </div>
            <p className="text-xs text-highland-ink/70">
              Final price depends on your group size and any optional extras you
              add during booking.
            </p>
            <Link
              href={`/dashboard/book?tourId=${tour.id}`}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-highland-gold text-highland-offwhite px-4 py-2 text-xs font-semibold hover:brightness-110"
            >
              Check dates &amp; book
            </Link>
          </div>

          {/* Optional extras & upgrades */}
          <div className="border border-highland-stone rounded-2xl bg-highland-offwhite p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-highland-ink">
                Optional extras &amp; upgrades
              </h3>
              <span className="text-[10px] text-highland-ink/60">
                Choose during booking
              </span>
            </div>

            {extras.length === 0 ? (
              <p className="text-highland-ink/60">
                This tour doesn&apos;t have any paid extras set up yet. All key
                experiences are included in the base price.
              </p>
            ) : (
              <ul className="space-y-2">
                {extras.map(extra => (
                  <li
                    key={extra.id}
                    className="border border-highland-stone/60 rounded-xl px-3 py-2 bg-highland-stone/10"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-highland-ink">
                        {extra.name}
                      </span>
                      <span className="font-semibold text-highland-gold">
                        £{extra.price}
                        <span className="text-[10px] text-highland-ink/60 ml-1">
                          {extra.chargeType === "PER_PERSON"
                            ? "per person"
                            : "per tour"}
                        </span>
                      </span>
                    </div>
                    {extra.description && (
                      <p className="mt-0.5 text-[11px] text-highland-ink/70">
                        {extra.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}