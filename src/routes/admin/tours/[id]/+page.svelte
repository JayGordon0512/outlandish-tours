<script lang="ts">
  export let data: any;

  const { tour, error } = data ?? {};

  const formatDateTime = (value?: string) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatPrice = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "—";
    return `£${value}`;
  };

  const pricingModeLabel = (tour: any) => {
    if (!tour) return "—";
    return tour.pricingMode === 1 ? "Per person" : "Per tour";
  };

  const durationLabel = (tour: any) => {
    if (!tour?.durationDays) return "—";
    const d = tour.durationDays;
    return `${d} day${d === 1 ? "" : "s"}`;
  };

  const galleryList = (tour: any): string[] => {
    if (!tour) return [];
    if (Array.isArray(tour.galleryImages)) return tour.galleryImages;
    if (typeof tour.galleryImages === "string") {
      // Fallback if stored as a comma or newline separated string
      return tour.galleryImages
        .split(/[\n,]+/)
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const optionsList = (tour: any): string[] => {
    if (!tour) return [];
    if (Array.isArray(tour.options)) return tour.options;
    if (typeof tour.options === "string") {
      return tour.options
        .split(/[\n,]+/)
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    return [];
  };
</script>

<div class="page-shell space-y-6">
  {#if error}
    <p class="text-sm text-red-600">{error}</p>
  {/if}

  {#if !tour}
    <p class="text-sm text-muted">Tour not found.</p>
  {:else}
    <!-- Header -->
    <header class="page-header">
      <div class="space-y-2">
        <div class="flex items-center gap-2 flex-wrap">
          <h1 class="page-title">
            {tour.title}
          </h1>

          <!-- Status badges -->
          {#if tour.isActive}
            <span class="badge badge-active">Active</span>
          {:else}
            <span class="badge badge-inactive">Inactive</span>
          {/if}

          {#if tour.isFeatured}
            <span class="badge badge-featured">
              Featured
            </span>
          {/if}
        </div>

        {#if tour.slug}
          <p class="text-meta font-mono">
            /tours/{tour.slug}
          </p>
        {/if}

        <p class="page-subtitle">
          Overview of this Outlandish tour, including pricing, media and meta.
        </p>
      </div>

      <div class="flex flex-wrap gap-2 text-sm">
        <a href="/admin/tours" class="btn-secondary btn-sm">
          Back to tours
        </a>
        <a
          href={`/admin/tours/${tour.id}/edit`}
          class="btn-primary btn-sm"
        >
          Edit tour
        </a>
        {#if tour.slug}
          <a
            href={`/tours/${tour.slug}`}
            class="btn-ghost btn-sm"
            target="_blank"
            rel="noreferrer"
          >
            View public page
          </a>
        {/if}
      </div>
    </header>

    <!-- Main grid -->
    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Left column: overview + description + options -->
      <div class="space-y-4 lg:col-span-2">
        <!-- Overview -->
        <section class="card space-y-3">
          <h2 class="text-sm font-semibold">Overview</h2>

          {#if tour.summary}
            <p class="text-sm">
              {tour.summary}
            </p>
          {/if}

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm mt-2">
            <div class="space-y-1">
              <div class="text-meta">Duration</div>
              <div class="font-semibold">
                {durationLabel(tour)}
              </div>
            </div>

            <div class="space-y-1">
              <div class="text-meta">Max group size</div>
              <div class="font-semibold">
                {tour.maxGroupSize ?? "—"}
              </div>
            </div>

            <div class="space-y-1">
              <div class="text-meta">Pricing</div>
              <div class="font-semibold">
                {formatPrice(tour.price)}
              </div>
              <div class="text-meta">
                {pricingModeLabel(tour)}
              </div>
            </div>
          </div>
        </section>

        <!-- Description -->
        <section class="card space-y-3">
          <h2 class="text-sm font-semibold">Full description</h2>

          {#if tour.description}
            <div class="text-sm space-y-2">
              {tour.description}
            </div>
          {:else}
            <p class="text-sm text-muted">
              No description set yet.
            </p>
          {/if}
        </section>

        <!-- Options / internal flags -->
        <section class="card space-y-3">
          <h2 class="text-sm font-semibold">Options & internal flags</h2>

          {#if optionsList(tour).length === 0}
            <p class="text-sm text-muted">
              No options configured for this tour yet.
            </p>
          {:else}
            <div class="flex flex-wrap gap-2">
              {#each optionsList(tour) as opt}
                <span class="badge badge-muted">
                  {opt}
                </span>
              {/each}
            </div>
          {/if}

          <p class="text-meta">
            These options are stored on the tour record. You can also manage
            structured extras via the Options section in admin.
          </p>
        </section>
      </div>

      <!-- Right column: media + meta -->
      <div class="space-y-4">
        <!-- Hero image -->
        <section class="card space-y-3">
          <h2 class="text-sm font-semibold">Hero image</h2>

          {#if tour.heroImageUrl}
            <div
              class="rounded-lg overflow-hidden border"
              style="border-color: var(--border-subtle);"
            >
              <img
                src={tour.heroImageUrl}
                alt={tour.title}
                class="w-full h-40 object-cover"
              />
            </div>

            <p class="text-meta font-mono break-all">
              {tour.heroImageUrl}
            </p>
          {:else}
            <p class="text-sm text-muted">
              No hero image set yet.
            </p>
          {/if}
        </section>

        <!-- Gallery -->
        <section class="card space-y-3">
          <h2 class="text-sm font-semibold">Gallery</h2>

          {#if galleryList(tour).length === 0}
            <p class="text-sm text-muted">
              No gallery images configured yet.
            </p>
          {:else}
            <div class="grid grid-cols-2 gap-2">
              {#each galleryList(tour) as img}
                <div
                  class="rounded-lg overflow-hidden border"
                  style="border-color: var(--border-subtle);"
                >
                  <img
                    src={img}
                    alt={tour.title}
                    class="w-full h-24 object-cover"
                  />
                </div>
              {/each}
            </div>

            <details class="mt-2">
              <summary class="text-meta cursor-pointer">
                Show image URLs
              </summary>
              <div class="mt-2 space-y-1">
                {#each galleryList(tour) as img}
                  <div class="text-meta font-mono break-all">
                    {img}
                  </div>
                {/each}
              </div>
            </details>
          {/if}
        </section>

        <!-- Meta -->
        <section class="card space-y-3">
          <h2 class="text-sm font-semibold">Meta</h2>

          <div class="space-y-2 text-sm">
            <div>
              <div class="text-meta">Tour ID</div>
              <div class="font-mono text-sm">
                {tour.id}
              </div>
            </div>

            <div>
              <div class="text-meta">Created</div>
              <div>{formatDateTime(tour.createdAt)}</div>
            </div>

            <div>
              <div class="text-meta">Last updated</div>
              <div>{formatDateTime(tour.updatedAt)}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  {/if}
</div>