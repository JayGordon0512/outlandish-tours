<!-- src/routes/contact/+page.svelte -->
<script lang="ts">
  export let data: any;
  export let form: any;

  const { tourId, tourTitle } = data ?? {};
  const success = form?.success === true;
  const error = form?.error as string | undefined;
  const values = form?.values ?? {};
</script>

<svelte:head>
  <title>Contact · Outlandish Tours</title>
</svelte:head>

<div class="page-shell space-y-6">
  <!-- Header -->
  <header class="page-header">
    <div>
      <h1 class="page-title">Contact &amp; tour enquiries</h1>
      <p class="page-subtitle">
        Tell us a little about your plans and we&apos;ll get back to you personally.
      </p>
    </div>

    <div class="flex flex-wrap gap-2 text-sm">
      <a href="/" class="btn-secondary btn-sm">
        Back to homepage
      </a>
    </div>
  </header>

  <!-- If form was submitted successfully -->
  {#if success}
    <section class="card">
      <h2 class="text-sm font-semibold mb-2">
        Thank you — we&apos;ve received your enquiry.
      </h2>
      <p class="text-sm text-muted">
        We&apos;ll be in touch shortly to confirm availability and help you plan your Outlandish experience.
      </p>
    </section>
  {:else}
    <!-- Main form -->
    <section class="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
      <form method="POST" class="card space-y-4">
        {#if error}
          <p class="text-sm" style="color: var(--danger);">
            {error}
          </p>
        {/if}

        <!-- Preserve tour info if passed -->
        {#if tourId}
          <input type="hidden" name="tourId" value={tourId} />
        {/if}
        {#if tourTitle}
          <input type="hidden" name="tourTitle" value={tourTitle} />
        {/if}

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label for="name" class="field-label">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              class="input"
              required
              value={values.name ?? ""}
            />
          </div>

          <div class="space-y-2">
            <label for="email" class="field-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              class="input"
              required
              value={values.email ?? ""}
            />
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label for="preferredDate" class="field-label">
              Preferred date (optional)
            </label>
            <input
              id="preferredDate"
              name="preferredDate"
              type="date"
              class="input"
              value={values.preferredDate ?? ""}
            />
          </div>

          <div class="space-y-2">
            <label for="guests" class="field-label">
              Number of guests (optional)
            </label>
            <input
              id="guests"
              name="guests"
              type="number"
              min="1"
              class="input"
              value={values.guests ?? ""}
            />
          </div>
        </div>

        <div class="space-y-2">
          <label for="message" class="field-label">Tell us about your plans</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            class="textarea"
            required
          >{values.message ?? (tourTitle
              ? `I’d like to enquire about "${tourTitle}".`
              : ""
          )}</textarea>
        </div>

        <div class="flex justify-end gap-2">
          <a href="/" class="btn-ghost btn-sm">Cancel</a>
          <button type="submit" class="btn-primary">
            Send enquiry
          </button>
        </div>
      </form>

      <!-- Sidebar / tour context -->
      <aside class="space-y-4">
        {#if tourTitle}
          <section class="card space-y-2">
            <h2 class="text-sm font-semibold">
              You&apos;re enquiring about
            </h2>
            <p class="text-sm">
              <strong>{tourTitle}</strong>
            </p>
            {#if tourId}
              <p class="text-meta">
                Internal ref: {tourId}
              </p>
            {/if}
          </section>
        {/if}

        <section class="card-tight space-y-2">
          <h3 class="text-xs font-semibold">
            How we handle enquiries
          </h3>
          <p class="text-xs text-muted">
            Every enquiry is reviewed personally. We&apos;ll confirm availability, refine your
            itinerary and answer any questions before you commit.
          </p>
        </section>
      </aside>
    </section>
  {/if}
</div>