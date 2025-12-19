<script lang="ts">
  export let data: any;
  export let form: any;

  const { tour, heroFiles = [], galleryFiles = [], tourOptions = [], selectedOptionIds = [] } = data;
  const error = form?.error ?? null;

  const values = form?.values ?? {
    title: tour.title ?? "",
    summary: tour.summary ?? "",
    description: tour.description ?? "",
    durationDays: tour.durationDays ?? "",
    maxGroupSize: tour.maxGroupSize ?? "",
    price: tour.price ?? "",
    pricingMode: tour.pricingMode ?? 0,
    pickupLocation: tour.pickupLocation ?? "",
    selectedOptionIds,
    isActive: !!tour.isActive,
    isFeatured: !!tour.isFeatured
  };

  const isChecked = (id: string) => (values.selectedOptionIds ?? []).includes(id);
</script>

<div class="page-shell space-y-6">
  <header class="page-header">
    <div>
      <h1 class="page-title">Edit tour</h1>
      <p class="page-subtitle">Update details and manage hero + gallery images.</p>
    </div>
    <div class="flex gap-2">
      <a href="/admin/tours" class="btn-secondary btn-sm">Back to tours</a>
      <a href={`/admin/tours/${tour.id}`} class="btn-ghost btn-sm">View</a>
    </div>
  </header>

  {#if error}
    <div class="card-danger text-sm">{error}</div>
  {/if}

  <div class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
    <!-- Main form -->
    <form method="POST" class="card space-y-5">
      <div class="space-y-1">
        <label class="field-label" for="title">Title</label>
        <input id="title" name="title" class="input" value={values.title} />
      </div>

      <div class="space-y-1">
        <label class="field-label" for="summary">Summary</label>
        <textarea id="summary" name="summary" class="textarea" rows="3">{values.summary}</textarea>
      </div>

      <div class="space-y-1">
        <label class="field-label" for="description">Description</label>
        <textarea id="description" name="description" class="textarea" rows="6">{values.description}</textarea>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-1">
          <label class="field-label" for="durationDays">Duration (days)</label>
          <input
            id="durationDays"
            name="durationDays"
            class="input"
            inputmode="numeric"
            value={values.durationDays}
          />
        </div>

        <div class="space-y-1">
          <label class="field-label" for="maxGroupSize">Max group size</label>
          <input
            id="maxGroupSize"
            name="maxGroupSize"
            class="input"
            inputmode="numeric"
            value={values.maxGroupSize}
          />
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-1">
          <label class="field-label" for="price">Price</label>
          <input id="price" name="price" class="input" inputmode="numeric" value={values.price} />
        </div>

        <div class="space-y-1">
          <label class="field-label" for="pricingMode">Pricing mode</label>
          <select id="pricingMode" name="pricingMode" class="input">
            <option value="0" selected={values.pricingMode === 0}>Per tour</option>
            <option value="1" selected={values.pricingMode === 1}>Per person</option>
          </select>
        </div>
      </div>

      <div class="space-y-1">
        <label class="field-label" for="pickupLocation">Pickup location (optional)</label>
        <input id="pickupLocation" name="pickupLocation" class="input" value={values.pickupLocation} />
      </div>

      <!-- ✅ Selectable options (no textarea) -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <!-- This is a section heading, not a label for a specific control -->
          <div class="field-label">Optional extras</div>
          <span class="text-meta">{tourOptions.length} available</span>
        </div>

        {#if tourOptions.length === 0}
          <div class="card text-sm">
            No options found. Add options in Admin → Options first.
          </div>
        {:else}
          <div class="grid gap-2 sm:grid-cols-2">
            {#each tourOptions as opt (opt.id)}
              <label class="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="optionIds"
                  value={opt.id}
                  checked={isChecked(opt.id)}
                />
                <span>
                  {opt.name}
                  <span class="text-meta">
                    — £{opt.price} ({opt.chargeType === "PER_PERSON" ? "per person" : "per tour"})
                  </span>
                </span>
              </label>
            {/each}
          </div>
        {/if}

        <p class="text-meta">
          These are saved via the TourExtraOption join table.
        </p>
      </div>

      <div class="flex gap-6">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" checked={values.isActive} />
          Active
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" checked={values.isFeatured} />
          Featured
        </label>
      </div>

      <div class="flex justify-end">
        <button type="submit" formaction="?/save" class="btn-primary btn-sm">Save changes</button>
      </div>
    </form>

    <!-- Sidebar: Images -->
    <div class="space-y-4">
      <div class="card space-y-3">
        <h2 class="text-sm font-semibold">Hero image</h2>

        {#if tour.heroImageUrl}
          <img src={tour.heroImageUrl} alt="Hero" class="w-full h-40 object-cover rounded-xl border" />
        {:else}
          <div class="text-sm text-muted">No hero image set.</div>
        {/if}

        <form method="POST" enctype="multipart/form-data" class="space-y-2">
          <label class="field-label" for="heroUpload">Upload new hero</label>
          <input id="heroUpload" type="file" name="hero" accept="image/*" class="block w-full text-sm" />
          <button type="submit" formaction="?/uploadHero" class="btn-secondary btn-sm">Upload</button>
        </form>

        {#if heroFiles.length > 0}
          <hr style="border-color: var(--border-subtle);" />
          <form method="POST" class="space-y-2">
            <label class="field-label" for="heroExisting">Or select existing</label>
            <select id="heroExisting" name="heroPath" class="input">
              {#each heroFiles as f}
                <option value={f.path}>{f.name}</option>
              {/each}
            </select>
            <button type="submit" formaction="?/setHeroFromExisting" class="btn-ghost btn-sm">
              Set hero
            </button>
          </form>
        {/if}

        {#if tour.heroImageUrl}
          <form
            method="POST"
            on:submit|preventDefault={(e) => {
              if (confirm("Remove hero image?")) (e.target as HTMLFormElement).submit();
            }}
          >
            <input type="hidden" name="kind" value="hero" />
            <input type="hidden" name="path" value={`tours/${tour.id}/hero/hero.jpg`} />
            <button type="submit" formaction="?/deleteImage" class="btn-danger btn-sm">Remove hero</button>
          </form>
        {/if}
      </div>

      <div class="card space-y-3">
        <h2 class="text-sm font-semibold">Gallery</h2>

        <form method="POST" enctype="multipart/form-data" class="space-y-2">
          <label class="field-label" for="galleryUpload">Upload gallery images</label>
          <input id="galleryUpload" type="file" name="gallery" accept="image/*" multiple class="block w-full text-sm" />
          <button type="submit" formaction="?/uploadGallery" class="btn-secondary btn-sm">Upload</button>
        </form>

        {#if galleryFiles.length > 0}
          <div class="grid grid-cols-3 gap-2">
            {#each galleryFiles as img}
              <div class="relative">
                <img src={img.url} alt={img.name} class="h-20 w-full object-cover rounded-lg border" />
                <form
                  method="POST"
                  class="absolute top-1 right-1"
                  on:submit|preventDefault={(e) => {
                    if (confirm("Delete this image?")) (e.target as HTMLFormElement).submit();
                  }}
                >
                  <input type="hidden" name="kind" value="gallery" />
                  <input type="hidden" name="path" value={img.path} />
                  <input type="hidden" name="url" value={img.url} />
                  <button type="submit" formaction="?/deleteImage" class="btn-danger btn-xs">×</button>
                </form>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-sm text-muted">No gallery images uploaded yet.</p>
        {/if}
      </div>
    </div>
  </div>
</div>