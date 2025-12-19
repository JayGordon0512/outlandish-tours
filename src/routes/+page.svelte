<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { formatPrice, formatDurationDays } from "$lib/utils/tourFormat";

  export let data: any;
  const { tours, homeContent } = data;

  const heroTitle = homeContent?.heroTitle || "Outlandish Tours";
  const heroSubtitle =
    homeContent?.heroSubtitle ||
    "Bespoke Highland & Outlander adventures crafted in the heart of Scotland.";
  const heroImageUrl = homeContent?.heroImageUrl || "/images/outlandish-hero-kilt.jpg";

  const heroPrimaryCtaLabel = homeContent?.heroPrimaryCtaLabel || "Explore all tours";
  const heroPrimaryCtaHref = homeContent?.heroPrimaryCtaHref || "/tours";

  const heroSecondaryCtaLabel =
    homeContent?.heroSecondaryCtaLabel || "View upcoming adventures";
  const heroSecondaryCtaHref = homeContent?.heroSecondaryCtaHref || "#tours-list";

  const introHeading = homeContent?.introHeading || "Crafted Highland & Outlander Experiences";
  const introBody =
    homeContent?.introBody ||
    "Every Outlandish tour is small-group, story-driven and curated personally from Scotland.";
</script>

<main class="min-h-screen">
  <!-- HERO -->
  <section
    class="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[420px] md:h-[560px] overflow-hidden"
  >
    <img src={heroImageUrl} alt={heroTitle} class="absolute inset-0 w-full h-full object-cover" />

    <!-- Overlay -->
    <div class="absolute inset-0" style="background-color: rgba(0, 0, 0, 0.35);"></div>

    <!-- Hero content -->
    <div class="absolute inset-0 flex items-center px-6 md:px-10">
      <div class="max-w-2xl space-y-4">
        <h1 class="text-4xl md:text-6xl font-semibold drop-shadow-lg" style="color: var(--offwhite);">
          {heroTitle}
        </h1>

        <p class="text-sm md:text-lg max-w-xl drop-shadow" style="color: rgba(247, 243, 233, 0.9);">
          {heroSubtitle}
        </p>

        <div class="mt-4 flex flex-wrap gap-3">
          <a href={heroPrimaryCtaHref} class="btn-primary">{heroPrimaryCtaLabel}</a>

          <a
            href={heroSecondaryCtaHref}
            class="btn-ghost"
            style="border-color: rgba(247, 243, 233, 0.7); color: var(--offwhite);"
          >
            {heroSecondaryCtaLabel}
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- CONTENT -->
  <div class="page-shell space-y-10">
    <!-- Intro -->
    <section class="space-y-3">
      <h2 class="text-xl md:text-2xl font-semibold" style="color: var(--ink);">
        {introHeading}
      </h2>
      <p class="text-sm md:text-base text-muted">{introBody}</p>
    </section>

    <!-- Tours -->
    <section id="tours-list" class="space-y-4">
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-lg md:text-xl font-semibold" style="color: var(--ink);">Our tours</h3>
        <a href="/tours" class="text-meta hover:underline">View all tours →</a>
      </div>

      {#if !tours || tours.length === 0}
        <p class="text-sm text-muted">No tours available yet. Check back soon!</p>
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {#each tours as tour}
            <a
              href={`/tours/${tour.slug}`}
              class="group border rounded-2xl overflow-hidden shadow-sm"
              style="border-color: var(--border-subtle); background-color: var(--offwhite);"
            >
              <!-- Image -->
              <div class="relative h-48 w-full" style="background-color: var(--stone);">
                <img
                  src={tour.heroImageUrl || "/images/default-tour-placeholder.jpg"}
                  alt={tour.title ?? "Tour image"}
                  class="w-full h-full object-cover"
                />

                {#if tour.isFeatured}
                  <span
                    class="absolute top-2 left-2 rounded-full px-2 py-1 text-[10px] font-semibold shadow"
                    style="background-color: var(--gold); color: var(--offwhite);"
                  >
                    Featured
                  </span>
                {/if}
              </div>

              <!-- Text -->
              <div class="p-4 space-y-2">
                <h4
                  class="font-semibold text-sm md:text-base group-hover:underline"
                  style="color: var(--ink);"
                >
                  {tour.title ?? "Untitled tour"}
                </h4>

                {#if tour.summary}
                  <p class="text-xs text-muted line-clamp-3">{tour.summary}</p>
                {/if}

                <!-- Card "footer" row: duration + price -->
                <div class="flex items-center justify-between text-[11px] mt-2" style="color: var(--text-muted);">
                  {#if formatDurationDays(tour.durationDays)}
                    <span>{formatDurationDays(tour.durationDays)}</span>
                  {:else}
                    <span></span>
                  {/if}

                  <span class="font-semibold" style="color: var(--ink);">
                    {formatPrice(tour)}
                  </span>
                </div>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </section>
  </div>
</main>