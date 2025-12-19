<script lang="ts">
  export let data: any;

  const { tours, error } = data;

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
</script>

<div class="page-shell space-y-6">
  <!-- Header -->
  <header class="page-header">
    <div>
      <h1 class="page-title">Tours</h1>
      <a
  href="/admin/tours/new"
  class="btn-ghost btn-sm"
>
  + New tour
</a>      <p class="page-subtitle">
        Manage Outlandish tours, pricing and availability.
      </p>
  </header>

  {#if error}
    <p class="text-sm text-red-600 mb-4">{error}</p>
  {/if}

  {#if !tours || tours.length === 0}
    <div class="card text-sm text-muted">
      No tours found. Create your first tour to get started.
    </div>
  {:else}
    <div class="table-shell">
      <table class="table">
        <thead>
          <tr class="table-head-row">
            <th class="table-head-cell">Tour</th>
            <th class="table-head-cell">Pricing</th>
            <th class="table-head-cell">Status</th>
            <th class="table-head-cell">Created</th>
            <th class="table-head-cell text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {#each tours as tour}
            <tr class="table-row">
              <!-- Tour info -->
              <td class="table-cell">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <!-- Make title clickable to go to detail page -->
                    <a
                      href={`/admin/tours/${tour.id}`}
                      class="font-medium hover:underline"
                    >
                      {tour.title ?? "Untitled tour"}
                    </a>

                    {#if tour.isFeatured === 1}
                      <span class="badge badge-featured">Featured</span>
                    {/if}
                  </div>

                  {#if tour.summary}
                    <p class="text-muted text-xs">
                      {tour.summary}
                    </p>
                  {/if}

                  {#if tour.slug}
                    <p class="text-meta font-mono">
                      /tours/{tour.slug}
                    </p>
                  {/if}
                </div>
              </td>

              <!-- Pricing -->
              <td class="table-cell">
                <div class="space-y-1">
                  <div class="font-medium">{formatPrice(tour.price)}</div>

                  <div class="text-meta">
                    {tour.pricingMode === 0 ? "Per tour" : "Per person"}
                  </div>

                  {#if tour.durationDays}
                    <div class="text-meta">
                      {tour.durationDays} day{tour.durationDays === 1 ? "" : "s"}
                    </div>
                  {/if}

                  {#if tour.maxGroupSize}
                    <div class="text-meta">
                      Max {tour.maxGroupSize} guests
                    </div>
                     {#if tour.pickupTime}
      <div class="text-[11px] text-slate-400">
        Pickup: {tour.pickupTime}
      </div>
    {/if}
                  {/if}
                </div>
              </td>

              <!-- Status -->
              <td class="table-cell">
                {#if tour.isActive === 1}
                  <span class="badge badge-active">Active</span>
                {:else}
                  <span class="badge badge-inactive">Inactive</span>
                {/if}
              </td>

              <!-- Created -->
              <td class="table-cell">
                <span class="text-meta">
                  {formatDateTime(tour.createdAt)}
                </span>
              </td>

              <!-- Actions -->
              <td class="table-cell-right">
                <div class="flex justify-end gap-2">
                  <a
                    href={`/admin/tours/${tour.id}`}
                    class="btn-ghost btn-sm"
                  >
                    View
                  </a>

                  <a
                    href={`/admin/tours/${tour.id}/edit`}
                    class="btn-secondary btn-sm"
                  >
                    Edit
                  </a>

                  <form method="POST" action="?/toggleStatus">
                    <input type="hidden" name="id" value={tour.id} />
                    <input
                      type="hidden"
                      name="current"
                      value={tour.isActive === 1 ? "1" : "0"}
                    />
                    <button type="submit" class="btn-ghost btn-sm">
                      {tour.isActive === 1 ? "Set inactive" : "Set active"}
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>