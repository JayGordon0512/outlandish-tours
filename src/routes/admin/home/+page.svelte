<script lang="ts">
  export let data: any;

  const { homeContent, imageOptions, error } = data ?? {};

  let uploadedFileName: string | null = null;

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      uploadedFileName = input.files[0].name;
    } else {
      uploadedFileName = null;
    }
  }
</script>

<div class="page-shell space-y-6">
  <!-- Header -->
  <header class="page-header">
    <div>
      <h1 class="page-title">Homepage content</h1>
      <p class="page-subtitle">
        Control the hero image, heading, intro text and CTAs displayed on the public homepage.
      </p>
    </div>

    <div class="flex flex-wrap gap-2 text-sm">
      <a href="/admin" class="btn-secondary btn-sm">
        Back to admin
      </a>
    </div>
  </header>

  {#if error}
    <p class="text-sm" style="color: var(--danger);">{error}</p>
  {/if}

  <form method="POST" enctype="multipart/form-data" class="space-y-6">
    <!-- Hero block -->
    <section class="card space-y-4">
      <h2 class="text-sm font-semibold">Hero section</h2>

      {#if homeContent?.id}
        <input type="hidden" name="id" value={homeContent.id} />
      {/if}

      <!-- Keep current hero image if nothing is changed -->
      <input
        type="hidden"
        name="currentHeroImageUrl"
        value={homeContent?.heroImageUrl ?? ""}
      />

      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <label for="heroTitle" class="field-label">Hero title</label>
          <input
            id="heroTitle"
            name="heroTitle"
            type="text"
            class="input"
            required
            value={homeContent?.heroTitle ?? "Outlandish Tours"}
          />
        </div>

        <div class="space-y-2">
          <label for="heroSubtitle" class="field-label">Hero subtitle</label>
          <textarea
            id="heroSubtitle"
            name="heroSubtitle"
            rows="3"
            class="textarea"
          >{homeContent?.heroSubtitle ??
`Bespoke Outlander & Highland adventures, crafted in the heart of Scotland.`}</textarea>
        </div>
      </div>

      <!-- Hero image controls -->
      <div class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start">
        <!-- Current preview -->
        <div class="space-y-2">
          <div class="field-label">Current hero image</div>

          {#if homeContent?.heroImageUrl}
            <div
              class="rounded-lg overflow-hidden border"
              style="border-color: var(--border-subtle); max-width: 320px;"
            >
              <img
                src={homeContent.heroImageUrl}
                alt="Current hero image"
                class="w-full h-44 object-cover"
              />
            </div>
            <p class="text-meta">
              This is the image currently shown on the homepage hero.
            </p>
          {:else}
            <p class="text-meta">
              No hero image set yet. Choose one from the library or upload a new image.
            </p>
          {/if}
        </div>

        <!-- Library + upload controls -->
        <div class="space-y-5">
          {#if imageOptions && imageOptions.length > 0}
            <div class="space-y-1">
              <label for="heroImageExisting" class="field-label">
                Select an existing image
              </label>
              <select
                id="heroImageExisting"
                name="heroImageExisting"
                class="select"
              >
                <option value="">
                  — Keep current hero image —
                </option>
                {#each imageOptions as img}
                  <option value={img.path}>
                    {img.path}
                  </option>
                {/each}
              </select>
              <p class="text-meta">
                Pick an image here, then click <strong>Save hero image</strong> to commit and update the preview.
              </p>
            </div>
          {/if}

          <div class="space-y-1">
            <label class="field-label">
              Or upload a new hero image
            </label>

            <!-- Hidden file input -->
            <input
              id="heroImageFile"
              name="heroImageFile"
              type="file"
              accept="image/*"
              class="hidden"
              on:change={handleFileSelect}
            />

            <div class="flex items-center gap-3">
              <label
                for="heroImageFile"
                class="btn-secondary inline-flex cursor-pointer btn-sm"
              >
                Browse…
              </label>

              <button
                type="submit"
                class="btn-secondary btn-sm"
                name="intent"
                value="save_hero"
              >
                Save hero image
              </button>
            </div>

            {#if uploadedFileName}
              <p class="text-meta">
                Selected: <strong>{uploadedFileName}</strong>
              </p>
            {/if}

            <p class="text-meta">
              Saving the hero image will upload any selected file or apply the library choice,
              then refresh this page so the thumbnail matches the live homepage.
            </p>
          </div>
        </div>
      </div>

      <!-- CTA controls -->
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <label class="field-label">Primary CTA (filled button)</label>
          <input
            name="heroPrimaryCtaLabel"
            type="text"
            class="input mb-1"
            placeholder="Button label (e.g. Explore All Tours)"
            value={homeContent?.heroPrimaryCtaLabel ?? "Explore All Tours"}
          />
          <input
            name="heroPrimaryCtaHref"
            type="text"
            class="input"
            placeholder="Link (e.g. /tours)"
            value={homeContent?.heroPrimaryCtaHref ?? "/tours"}
          />
          <p class="text-meta">
            This appears as the gold filled button on the hero.
          </p>
        </div>

        <div class="space-y-2">
          <label class="field-label">Secondary CTA (outline button)</label>
          <input
            name="heroSecondaryCtaLabel"
            type="text"
            class="input mb-1"
            placeholder="Button label (e.g. View Upcoming Adventures)"
            value={homeContent?.heroSecondaryCtaLabel ?? "View Upcoming Adventures"}
          />
          <input
            name="heroSecondaryCtaHref"
            type="text"
            class="input"
            placeholder="Link (e.g. #tours-list or /about)"
            value={homeContent?.heroSecondaryCtaHref ?? "#tours-list"}
          />
          <p class="text-meta">
            This appears as the outlined button beside the primary CTA.
          </p>
        </div>
      </div>
    </section>

    <!-- Intro block -->
    <section class="card space-y-4">
      <h2 class="text-sm font-semibold">Intro section</h2>

      <div class="space-y-2">
        <label for="introHeading" class="field-label">Intro heading</label>
        <input
          id="introHeading"
          name="introHeading"
          type="text"
          class="input"
          required
          value={homeContent?.introHeading ?? "Crafted Highland & Outlander Experiences"}
        />
      </div>

      <div class="space-y-2">
        <label for="introBody" class="field-label">Intro body</label>
        <textarea
          id="introBody"
          name="introBody"
          rows="4"
          class="textarea"
        >{homeContent?.introBody ??
`Every Outlandish tour is small-group, story-driven and curated personally from Scotland.`}</textarea>
      </div>
    </section>

    <!-- Submit -->
    <div class="flex justify-end gap-2">
      <a href="/admin" class="btn-ghost btn-sm">Cancel</a>
      <button
        type="submit"
        class="btn-primary"
        name="intent"
        value="save_all"
      >
        Save homepage
      </button>
    </div>
  </form>
</div>