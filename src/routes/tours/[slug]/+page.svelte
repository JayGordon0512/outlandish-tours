<!-- src/routes/tours/[slug]/+page.svelte -->
<script lang="ts">
  import { error as kitError } from "@sveltejs/kit";
  import { formatPrice, formatDurationDays, formatMaxGroupSize } from "$lib/utils/tourFormat";

  export let data: any;
  const { tour, extraOptions = [] } = data;

  if (!tour) {
    throw kitError(404, "Tour not found");
  }

  const heroImageUrl = tour.heroImageUrl || "/images/default-tour-placeholder.jpg";

  const durationLabel = formatDurationDays(tour.durationDays);
  const priceText = formatPrice(tour); // always returns a string
  const maxGroupLabel = formatMaxGroupSize(tour.maxGroupSize);

  const chargeTypeLabel = (t: string) => (t === "PER_PERSON" ? "per person" : "per tour");
</script>

<div class="page-shell space-y-8">
  <!-- Hero section: image + key facts -->
  <section class="grid gap-6 md:grid-cols-[2fr,1fr] items-start">
    <!-- Left: main content -->
    <article class="space-y-5">
      <!-- Hero image -->
      <div class="overflow-hidden rounded-2xl border" style="border-color: var(--border-subtle);">
        <img
          src={heroImageUrl}
          alt={tour.title ?? "Outlandish tour"}
          class="w-full h-64 md:h-80 object-cover"
        />
      </div>

      <!-- Title + meta -->
      <header class="space-y-2">
        <h1 class="text-2xl md:text-3xl font-semibold page-title">
          {tour.title ?? "Untitled tour"}
        </h1>

        {#if tour.summary}
          <p class="text-sm md:text-base text-muted">
            {tour.summary}
          </p>
        {/if}

        <div class="flex flex-wrap gap-3 text-xs md:text-[13px] text-muted">
          {#if durationLabel}
            <span class="badge badge-muted">{durationLabel}</span>
          {/if}

          <!-- Always safe: formatPrice returns a string -->
          <span class="badge badge-active">{priceText}</span>

          {#if maxGroupLabel}
            <span class="badge badge-muted">{maxGroupLabel}</span>
          {/if}

          {#if tour.isFeatured}
            <span class="badge badge-featured">Featured experience</span>
          {/if}
        </div>
      </header>

      <!-- Description -->
      {#if tour.description}
        <section class="card space-y-2">
          <h2 class="text-sm font-semibold">About this tour</h2>
          <p class="text-sm leading-relaxed text-muted" style="white-space: pre-line;">
            {tour.description}
          </p>
        </section>
      {/if}

      <!-- Optional extras -->
      {#if extraOptions?.length}
        <section class="card space-y-2">
          <h2 class="text-sm font-semibold">Optional extras</h2>

          <div class="space-y-2">
            {#each extraOptions as opt (opt.id)}
              <div class="text-sm">
                <div class="flex items-center justify-between gap-4">
                  <span class="font-medium" style="color: var(--ink);">{opt.name}</span>
                  <span class="text-muted">
                    £{opt.price} {chargeTypeLabel(opt.chargeType)}
                  </span>
                </div>

                {#if opt.description}
                  <div class="text-meta">{opt.description}</div>
                {/if}
              </div>
            {/each}
          </div>

          <p class="text-meta">
            You can select extras during booking.
          </p>
        </section>
      {/if}
    </article>

    <!-- Right: booking CTA -->
    <aside class="card space-y-4">
      <h2 class="text-sm font-semibold">Ready to start your adventure?</h2>

      <div class="space-y-2 text-sm text-muted">
        <p>
          Choose your date and group size on the next step, then pay a secure online deposit to
          lock in your Outlandish experience.
        </p>

        <p class="text-sm">
          <span class="font-semibold" style="color: var(--ink);">
            {priceText}
          </span>
          {#if durationLabel}
            <span class="text-meta"> · {durationLabel}</span>
          {/if}
        </p>
      </div>

      <div class="space-y-2">
        <a href={`/tours/${tour.slug}/book`} class="btn-primary w-full text-center">
          Book this tour
        </a>
        <p class="text-meta">You’ll create an account and pay a deposit securely via Stripe.</p>
      </div>
    </aside>
  </section>
</div>