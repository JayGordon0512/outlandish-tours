<!-- src/routes/admin/guides/+page.svelte -->
<script lang="ts">
  export let data: any;

  const { guides, bookingCounts, error } = data;

  const formatGuideName = (g: any) =>
    [g.firstName, g.lastName].filter(Boolean).join(" ");

  const formatUpcoming = (id: string) => bookingCounts?.[id] ?? 0;

  const formatEmail = (email?: string | null) => email ?? "—";
  const formatMobile = (mobile?: string | null) => mobile ?? "—";
</script>

<div class="page-shell space-y-6">
  <!-- Header -->
  <header class="page-header">
    <div>
      <h1 class="page-title">Guides</h1>
      <p class="page-subtitle">
        Manage Outlandish guides, availability and assignments.
      </p>
    </div>

    <a href="/admin/guides/new" class="btn-primary">
      + New guide
    </a>
  </header>

  {#if error}
    <div class="card-danger text-sm">
      {error}
    </div>
  {/if}

  {#if !guides || guides.length === 0}
    <div class="card text-sm">
      No guides found. Create your first guide to get started.
    </div>
  {:else}
    <section class="table-shell">
      <table class="table">
        <thead>
          <tr class="table-head-row">
            <th class="table-head-cell">Guide</th>
            <th class="table-head-cell">Contact</th>
            <th class="table-head-cell">Upcoming bookings</th>
            <th class="table-head-cell">Status</th>
            <th class="table-head-cell text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each guides as guide}
            <tr class="table-row">
              <!-- Guide -->
              <td class="table-cell align-top">
                <div class="flex items-center gap-3">
                  {#if guide.photoUrl}
                    <img
                      src={guide.photoUrl}
                      alt={formatGuideName(guide)}
                      class="h-10 w-10 rounded-full object-cover border"
                    />
                  {:else}
                    <div
                      class="h-10 w-10 rounded-full flex items-center justify-center text-xs font-semibold"
                      style="background-color: var(--accent-soft); color: var(--ink); border: 1px solid var(--accent);"
                    >
                      {(guide.firstName?.[0] ?? "G")}{guide.lastName?.[0] ?? ""}
                    </div>
                  {/if}

                  <div class="space-y-1">
                    <div class="font-semibold">
                      {formatGuideName(guide) || "Unnamed guide"}
                    </div>
                    <div class="text-meta mono">
                      {guide.id}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Contact -->
              <td class="table-cell align-top">
                <div class="space-y-1 text-sm">
                  <div>{formatEmail(guide.email)}</div>
                  <div class="text-meta">{formatMobile(guide.mobile)}</div>
                  {#if guide.address}
                    <div class="text-meta">
                      {guide.address}
                    </div>
                  {/if}
                </div>
              </td>

              <!-- Upcoming bookings -->
              <td class="table-cell align-top">
                <div class="space-y-2 text-sm">
                  <div class="font-semibold">
                    {formatUpcoming(guide.id)}
                  </div>
                  <a
                    href={`/admin/bookings?guideId=${encodeURIComponent(guide.id)}`}
                    class="text-meta hover:underline"
                    style="color: var(--accent);"
                  >
                    View bookings
                  </a>
                </div>
              </td>

              <!-- Status -->
              <td class="table-cell align-top">
                {#if guide.isActive}
                  <span class="badge badge-active text-xs">
                    Active
                  </span>
                {:else}
                  <span class="badge badge-inactive text-xs">
                    Inactive
                  </span>
                {/if}
              </td>

              <!-- Actions -->
              <td class="table-cell table-cell-right align-top">
                <div class="flex justify-end gap-2">
                  <a href={`/admin/guides/${guide.id}`} class="btn-ghost btn-xs">
                    Edit
                  </a>

                  <form method="POST" action="?/toggleActive">
                    <input type="hidden" name="id" value={guide.id} />
                    <input
                      type="hidden"
                      name="current"
                      value={guide.isActive ? "true" : "false"}
                    />
                    <button type="submit" class="btn-secondary btn-xs">
                      {guide.isActive ? "Set inactive" : "Set active"}
                    </button>
                  </form>

                  <form
                    method="POST"
                    action="?/deleteGuide"
                    on:submit|preventDefault={(e) => {
                      if (confirm("Delete this guide? This cannot be undone.")) {
                        (e.target as HTMLFormElement).submit();
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={guide.id} />
                    <button type="submit" class="btn-danger btn-xs">
                      Delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/if}
</div>