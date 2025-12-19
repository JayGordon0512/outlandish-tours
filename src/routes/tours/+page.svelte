<script lang="ts">
  export let data: any;

  const { tours, error } = data ?? {};
  const formatPrice = (tour: any) => {
  if (tour.price == null) return "Price on request";

  if (tour.pricingMode === 0) return `From £${tour.price} per tour`;
  if (tour.pricingMode === 1) return `From £${tour.price} per person`;

  return "Price on request";
};
</script>


<svelte:head>
  <title>Our Tours · Outlandish Tours</title>
</svelte:head>

<div class="page-shell space-y-6">
  <!-- Header -->
  <header class="page-header">
    <div>
      <h1 class="page-title">Our Tours</h1>
      <p class="page-subtitle">
        Small-group, story-driven Highland &amp; Outlander experiences, crafted in Scotland.
      </p>
    </div>

    <div class="flex flex-wrap gap-2 text-sm">
      <a href="/" class="btn-secondary btn-sm">Back to homepage</a>
    </div>
  </header>

  {#if error}
    <p class="text-sm" style="color: var(--danger);">
      {error}
    </p>
  {/if}

  {#if !tours || tours.length === 0}
    <div class="card">
      <p class="text-sm text-muted">
        No tours are currently available. Please check back soon or contact us for bespoke options.
      </p>
    </div>
  {:else}
    <!-- Tours grid -->
    <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {#each tours as tour}
        <a
          href={`/tours/${tour.slug}`}
          class="group card p-0 overflow-hidden flex flex-col"
        >
          <!-- Image -->
          <div
            class="relative h-44 w-full"
            style="background-color: var(--bg-elevated);"
          >
            <img
              src={tour.heroImageUrl ?? "/images/default-tour-placeholder.jpg"}
              alt={tour.title}
              class="w-full h-full object-cover"
            />

            {#if tour.isFeatured === true || tour.isFeatured === 1}
              <span class="badge badge-featured absolute top-2 left-2">
                Featured
              </span>
            {/if}
          </div>

          <!-- Content -->
          <div class="p-4 space-y-2">
            <div class="flex items-start justify-between gap-2">
              <h2 class="font-semibold text-sm md:text-base page-title" style="font-size: 0.95rem;">
                {tour.title ?? "Untitled tour"}
              </h2>

              {#if tour.durationDays}
                <span class="badge badge-muted">
                  {tour.durationDays} day{tour.durationDays === 1 ? "" : "s"}
                </span>
              {/if}
            </div>

            {#if tour.summary}
              <p class="text-xs text-muted line-clamp-3">
                {tour.summary}
              </p>
            {/if}

            <div class="flex items-center justify-between pt-1 text-[11px] text-muted">
              <span>{formatPrice(tour)}</span>
              {#if tour.maxGroupSize}
                <span>Max {tour.maxGroupSize} guests</span>
              {/if}
            </div>

            <p class="text-meta mt-1">
              View details →
            </p>
          </div>
        </a>
      {/each}
    </section>
  {/if}
</div>