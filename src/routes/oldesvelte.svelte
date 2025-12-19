<script lang="ts">
  export let data: any;

  const { tours, homeContent } = data ?? {};

  // HERO TEXT
  const heroTitle =
    homeContent?.heroTitle ?? "Outlandish Experience";

  const heroSubtitle =
    homeContent?.heroSubtitle ??
    "Bespoke Outlander & Highland adventures, crafted in the heart of Scotland.";

  // HERO IMAGE (try multiple keys just in case)
  const heroImageUrl =
    homeContent?.heroImageUrl ??
    homeContent?.heroImageurl ??
    homeContent?.heroimageurl ??
    "/images/outlandish-hero-kilt.jpg";

  // CTAs (driven from admin)
  const primaryCtaLabel =
    homeContent?.heroPrimaryCtaLabel ?? "Explore All Tours";
  const primaryCtaHref =
    homeContent?.heroPrimaryCtaHref ?? "/tours";

  const secondaryCtaLabel =
    homeContent?.heroSecondaryCtaLabel ?? "View Upcoming Adventures";
  const secondaryCtaHref =
    homeContent?.heroSecondaryCtaHref ?? "#tours-list";

  // INTRO SECTION
  const introHeading =
    homeContent?.introHeading ??
    "Crafted Highland & Outlander Experiences";

  const introBody =
    homeContent?.introBody ??
    "Every Outlandish tour is small-group, story-driven and curated personally from Scotland.";
</script>

<svelte:head>
  <title>Outlandish Tours</title>
</svelte:head>

<!-- HERO SECTION -->
<section class="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[420px] md:h-[560px] overflow-hidden">
  <img
    src={heroImageUrl}
    alt="Outlandish Tours hero image"
    class="w-full h-full object-cover"
  />

  <!-- Dark overlay for contrast -->
  <div class="absolute inset-0 bg-black/35"></div>

  <!-- Hero text -->
  <div class="absolute inset-0 flex items-center px-6 md:px-10">
    <div class="max-w-2xl space-y-4">
      <h1
        class="text-4xl md:text-6xl font-semibold drop-shadow"
        style="color: var(--offwhite);"
      >
        {heroTitle}
      </h1>

      <p
  class="text-sm md:text-lg max-w-xl drop-shadow"
  style="color: rgba(247, 243, 233, 0.92);"
>
  {heroSubtitle}
</p>
      <div class="flex flex-wrap gap-3 pt-2">
        <!-- Primary CTA (gold filled button) -->
        <a
          href={primaryCtaHref}
          class="px-6 py-3 text-sm rounded-full font-semibold hover:brightness-110 transition"
          style="background-color: var(--gold); color: var(--offwhite);"
        >
          {primaryCtaLabel}
        </a>

        <!-- Secondary CTA (outline button) -->
        <a
          href={secondaryCtaHref}
          class="px-6 py-3 text-sm rounded-full border transition"
          style="
            border-color: rgba(247, 243, 233, 0.7);
            color: var(--offwhite);
          "
        >
          {secondaryCtaLabel}
        </a>
      </div>
    </div>
  </div>
</section>

<!-- MAIN CONTENT WRAPPER -->
<div class="max-w-5xl mx-auto px-4 py-10 space-y-10">
  <!-- INTRO SECTION -->
  <section class="space-y-3">
    <h2 class="text-xl md:text-2xl font-semibold" style="color: var(--ink);">
      {introHeading}
    </h2>
    <p class="text-sm md:text-base" style="color: rgba(59, 48, 36, 0.8);">
      {introBody}
    </p>
  </section>

  <!-- TOURS LIST -->
  <section id="tours-list" class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg md:text-xl font-semibold" style="color: var(--ink);">
        Our Tours
      </h3>

      <a
        href="/tours"
        class="text-xs md:text-sm"
        style="color: rgba(59, 48, 36, 0.7);"
      >
        View all tours →
      </a>
    </div>

    {#if !tours || tours.length === 0}
      <p class="text-sm" style="color: rgba(59, 48, 36, 0.7);">
        No tours available yet. Check back soon!
      </p>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {#each tours as tour}
          <a
            href={`/tours/${tour.slug}`}
            class="group border rounded-2xl overflow-hidden transition"
            style="border-color: var(--stone); background-color: var(--offwhite);"
          >
            <!-- Thumbnail -->
            <div
              class="relative h-48 w-full"
              style="background-color: rgba(217, 215, 202, 0.3);"
            >
              <img
                src={tour.heroImageUrl ?? "/images/default-tour-placeholder.jpg"}
                alt={tour.title}
                class="w-full h-full object-cover"
              />

              {#if tour.isFeatured}
                <span
                  class="absolute top-2 left-2 rounded-full text-[10px] font-semibold px-2 py-1 shadow"
                  style="background-color: var(--gold); color: var(--offwhite);"
                >
                  Featured
                </span>
              {/if}
            </div>

            <!-- Card content -->
            <div class="p-4 space-y-2">
              <h4
                class="font-semibold text-sm md:text-base group-hover:underline"
                style="color: var(--ink);"
              >
                {tour.title}
              </h4>

              {#if tour.summary}
                <p class="text-xs" style="color: rgba(59, 48, 36, 0.7);">
                  {tour.summary}
                </p>
              {/if}

             <div class="flex items-center justify-between text-[11px] mt-2 text-highland-ink/70">
  {#if tour.durationDays}
    <span>
      {tour.durationDays} day{tour.durationDays !== 1 ? "s" : ""}
    </span>
  {/if}
  {#if tour.pricePerPerson}
    <span>From £{tour.pricePerPerson}</span>
  {/if}
</div>            </div>
          </a>
        {/each}
      </div>
    {/if}
  </section>
</div>