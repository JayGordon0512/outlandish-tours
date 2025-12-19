<!-- src/routes/admin/tours/new/+page.svelte -->
<script lang="ts">
  export let data: any;
  export let form: any;

  const tourOptions = data?.tourOptions ?? [];

  const values = form?.values ?? {
    title: "",
    slug: "",
    summary: "",
    description: "",
    durationDays: "",
    maxGroupSize: "",
    price: "",
    pricingMode: 0,
    pickupLocation: "",
    pickupTime: "",
    selectedOptionIds: [],
    isActive: true,
    isFeatured: false
  };

  const error = form?.error ?? null;

  let slugTouched = false;

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  $: if (!slugTouched && values.title) {
    values.slug = slugify(values.title);
  }

  // selection helper
  const isChecked = (id: any) => (values.selectedOptionIds ?? []).includes(id);
</script>

<div class="page-shell space-y-6">
  <header class="page-header">
    <div>
      <h1 class="page-title">New tour</h1>
      <p class="page-subtitle">Create a new Outlandish tour.</p>
    </div>

    <a href="/admin/tours" class="btn-secondary btn-sm">Back to tours</a>
  </header>

  {#if error}
    <div class="card-danger text-sm">{error}</div>
  {/if}

  <form method="POST" class="card space-y-5">
    <!-- Title + Slug -->
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1">
        <label for="title" class="field-label">Title</label>
        <input id="title" name="title" class="input" bind:value={values.title} />
      </div>

      <div class="space-y-1">
        <label for="slug" class="field-label">Slug</label>
        <input
          id="slug"
          name="slug"
          class="input mono"
          bind:value={values.slug}
          on:input={() => (slugTouched = true)}
        />
        <p class="text-meta">Auto-generated from the title (you can override it).</p>
      </div>
    </div>

    <!-- Summary -->
    <div class="space-y-1">
      <label for="summary" class="field-label">Summary</label>
      <textarea id="summary" name="summary" class="textarea" rows="3" bind:value={values.summary} />
    </div>

    <!-- Description -->
    <div class="space-y-1">
      <label for="description" class="field-label">Description</label>
      <textarea id="description" name="description" class="textarea" rows="6" bind:value={values.description} />
    </div>

    <!-- Duration + Max group -->
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1">
        <label for="durationDays" class="field-label">Duration (days)</label>
        <input id="durationDays" name="durationDays" type="number" min="1" class="input" bind:value={values.durationDays} />
      </div>

      <div class="space-y-1">
        <label for="maxGroupSize" class="field-label">Max group size</label>
        <input id="maxGroupSize" name="maxGroupSize" type="number" min="1" class="input" bind:value={values.maxGroupSize} />
      </div>
    </div>

    <!-- Price + Pricing mode -->
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1">
        <label for="price" class="field-label">Price</label>
        <input id="price" name="price" type="number" min="0" class="input" bind:value={values.price} />
        <p class="text-meta">Leave blank to show “Price on request”.</p>
      </div>

      <div class="space-y-1">
        <label for="pricingMode" class="field-label">Pricing mode</label>
        <select id="pricingMode" name="pricingMode" class="select" bind:value={values.pricingMode}>
          <option value="0">Per tour</option>
          <option value="1">Per person</option>
        </select>
      </div>
    </div>

    <!-- Pickup location + time -->
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1">
        <label for="pickupLocation" class="field-label">Pickup location</label>
        <input id="pickupLocation" name="pickupLocation" class="input" bind:value={values.pickupLocation} placeholder="Optional" />
      </div>

      <div class="space-y-1">
        <label for="pickupTime" class="field-label">Pickup time</label>
        <input id="pickupTime" name="pickupTime" class="input" bind:value={values.pickupTime} placeholder="Optional (e.g. 09:30)" />
      </div>
    </div>

    <!-- ✅ Options: selectable from table -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="field-label">Tour options</label>
        <span class="text-meta">{tourOptions.length} available</span>
      </div>

      {#if tourOptions.length === 0}
        <div class="card text-sm">
          No options found. Add options in the Options table first.
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
              <span>{opt.name}</span>
            </label>
          {/each}
        </div>
      {/if}

      <p class="text-meta">
        These are saved onto the Tour record as a text[] (option titles).
      </p>
    </div>

    <!-- Toggles -->
    <div class="grid gap-4 md:grid-cols-2">
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" checked={values.isActive} />
        <span>Active</span>
      </label>

      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isFeatured" checked={values.isFeatured} />
        <span>Featured</span>
      </label>
    </div>

    <div class="flex justify-end pt-2">
      <button type="submit" class="btn-primary btn-sm">Create tour</button>
    </div>
  </form>
</div>
