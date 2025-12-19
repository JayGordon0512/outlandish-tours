<script lang="ts">
  export let data: any;
  export let form: any;

  const options = data?.options ?? [];
  const error = form?.error ?? null;

  const values = form?.values ?? {
    name: "",
    description: "",
    price: "",
    chargeType: "",
    isActive: true
  };

  let editingId: string | null = null;

  const startEdit = (opt: any) => {
    editingId = opt.id;
  };

  const cancelEdit = () => {
    editingId = null;
  };
</script>

<div class="page-shell space-y-6">
  <header class="page-header">
    <div>
      <h1 class="page-title">Options</h1>
      <p class="page-subtitle">Manage selectable extras for tours.</p>
    </div>

    <a href="/admin/tours" class="btn-secondary btn-sm">Back to tours</a>
  </header>

  {#if error}
    <div class="card-danger text-sm">{error}</div>
  {/if}

  <!-- Create -->
  <form method="POST" class="card space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold">Add option</h2>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-1">
        <label class="field-label" for="name">Name</label>
        <input id="name" name="name" class="input" value={values.name} />
      </div>

      <div class="space-y-1">
        <label class="field-label" for="price">Price</label>
        <input id="price" name="price" class="input" inputmode="numeric" value={values.price} />
      </div>

      <div class="space-y-1 md:col-span-2">
        <label class="field-label" for="description">Description (optional)</label>
        <input id="description" name="description" class="input" value={values.description} />
      </div>

      <div class="space-y-1">
        <label class="field-label" for="chargeType">Charge type</label>
        <select id="chargeType" name="chargeType" class="input">
  <option value="" selected={values.chargeType === ""} disabled>Select…</option>
  <option value="PER_TOUR" selected={values.chargeType === "PER_TOUR"}>Per Tour </option>
  <option value="PER_PERSON" selected={values.chargeType === "PER_PERSON"}>Per Person</option>
</select>
<p class="text-meta">How should this extra be charged?</p>
      </div>

      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" checked={values.isActive} />
        Active
      </label>
    </div>

    <div class="flex justify-end">
      <button type="submit" formaction="?/create" class="btn-primary btn-sm">Create option</button>
    </div>
  </form>

  <!-- List -->
  <div class="card space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold">All options</h2>
      <span class="text-meta">{options.length} total</span>
    </div>

    {#if options.length === 0}
      <div class="text-sm text-muted">No options yet.</div>
    {:else}
      <div class="space-y-2">
        {#each options as opt (opt.id)}
          <div class="flex items-start justify-between gap-4 border-b pb-3" style="border-color: var(--border-subtle);">
            <div class="space-y-1" style="flex:1;">
              {#if editingId === opt.id}
                <form method="POST" class="space-y-2">
                  <input type="hidden" name="id" value={opt.id} />

                  <div class="grid gap-3 md:grid-cols-2">
                    <div class="space-y-1">
                      <label class="field-label">Name</label>
                      <input class="input" name="name" value={opt.name} />
                    </div>

                    <div class="space-y-1">
                      <label class="field-label">Price</label>
                      <input class="input" name="price" inputmode="numeric" value={opt.price} />
                    </div>

                    <div class="space-y-1 md:col-span-2">
                      <label class="field-label">Description</label>
                      <input class="input" name="description" value={opt.description ?? ""} />
                    </div>

                    <div class="space-y-1">
                      <label class="field-label">Charge type</label>
                     <select name="chargeType" class="input">
  <option value="PER_TOUR" selected={opt.chargeType === "PER_TOUR"}>Per Tour</option>
  <option value="PER_PERSON" selected={opt.chargeType === "PER_PERSON"}>Per Person</option>
</select>                    </div>

                    <label class="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="isActive" checked={opt.isActive !== false} />
                      Active
                    </label>
                  </div>

                  <div class="flex gap-2">
                    <button type="submit" formaction="?/update" class="btn-primary btn-sm">Save</button>
                    <button type="button" class="btn-ghost btn-sm" on:click={cancelEdit}>Cancel</button>
                  </div>
                </form>
              {:else}
                <div class="flex items-center gap-2">
                  <div class="text-sm font-semibold">{opt.name}</div>
                  {#if opt.isActive === false}
                    <span class="text-meta">(inactive)</span>
                  {/if}
                </div>

                {#if opt.description}
                  <div class="text-sm text-muted">{opt.description}</div>
                {/if}

                <div class="text-meta">
                  £{opt.price} · {opt.chargeType === "PER_PERSON" ? "Per Person" : "Per Tour"}
                </div>
              {/if}
            </div>

            <div class="flex items-center gap-2">
              {#if editingId !== opt.id}
                <button type="button" class="btn-ghost btn-sm" on:click={() => startEdit(opt)}>Edit</button>
              {/if}

              <form method="POST">
                <input type="hidden" name="id" value={opt.id} />
                <input type="hidden" name="nextActive" value={opt.isActive === false ? "true" : "false"} />
                <button type="submit" formaction="?/toggleActive" class="btn-ghost btn-sm">
                  {opt.isActive === false ? "Activate" : "Deactivate"}
                </button>
              </form>

              <form
                method="POST"
                on:submit|preventDefault={(e) => {
                  if (confirm("Delete this option?")) (e.target as HTMLFormElement).submit();
                }}
              >
                <input type="hidden" name="id" value={opt.id} />
                <button type="submit" formaction="?/delete" class="btn-danger btn-sm">Delete</button>
              </form>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>