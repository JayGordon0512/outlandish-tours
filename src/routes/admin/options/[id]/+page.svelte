<script lang="ts">
  export let data: any;
  export let form: any;

  const option = data.option;

  const effectiveValues = form?.values ?? option;

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
</script>

<div class="max-w-3xl mx-auto px-4 py-10 space-y-6">
  <header class="flex items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold">Edit extra option</h1>
      <p class="text-sm text-slate-400 mt-1">
        Option ID:
        <span class="font-mono">{option.id}</span>
      </p>
    </div>
    <a
      href="/admin/options"
      class="text-sm underline underline-offset-2 hover:no-underline text-slate-300"
    >
      ← Back to options
    </a>
  </header>

  <!-- Edit form -->
  <form
    method="POST"
    action="?/save"
    class="space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6"
  >
    {#if form?.message}
      <p class="text-sm text-red-300 mb-2">
        {form.message}
        {#if form.dbError}
          <span class="block text-[11px] text-red-400 mt-1">
            {form.dbError}
          </span>
        {/if}
      </p>
    {/if}

    <div class="space-y-2">
      <label class="text-sm font-medium" for="name">Name</label>
      <input
        id="name"
        name="name"
        type="text"
        class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
        value={effectiveValues.name ?? ""}
        required
      />
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium" for="description">Description</label>
      <textarea
        id="description"
        name="description"
        rows="3"
        class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
        placeholder="Short description of what this option includes…"
      >{effectiveValues.description ?? ""}</textarea>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <div class="space-y-2">
        <label class="text-sm font-medium" for="price">Price (£)</label>
        <input
          id="price"
          name="price"
          type="number"
          min="0"
          step="1"
          class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
          value={effectiveValues.price ?? ""}
        />
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium" for="chargeType">Charge type</label>
        <select
          id="chargeType"
          name="chargeType"
          class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
        >
          <option
            value="PerPerson"
            selected={effectiveValues.chargeType !== "PerTour"}
          >
            Per person
          </option>
          <option
            value="PerTour"
            selected={effectiveValues.chargeType === "PerTour"}
          >
            Per tour
          </option>
        </select>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium" for="isActive">Status</label>
        <select
          id="isActive"
          name="isActive"
          class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
        >
          <option
            value="1"
            selected={effectiveValues.isActive !== false && effectiveValues.isActive !== "0"}
          >
            Active
          </option>
          <option
            value="0"
            selected={effectiveValues.isActive === false || effectiveValues.isActive === "0"}
          >
            Inactive
          </option>
        </select>
      </div>
    </div>

    <div class="flex justify-between items-center text-[11px] text-slate-400">
      <div class="space-y-1">
        <div>Created: {formatDateTime(option.createdAt)}</div>
        <div>Updated: {formatDateTime(option.updatedAt)}</div>
      </div>
    </div>

    <div class="flex justify-end gap-3 text-sm pt-2">
      <a
        href="/admin/options"
        class="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-900"
      >
        Cancel
      </a>
      <button
        type="submit"
        class="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
      >
        Save changes
      </button>
    </div>
  </form>

  <!-- Danger zone -->
  <section class="rounded-xl border border-red-900 bg-red-950/40 p-6 space-y-3">
    <h2 class="text-sm font-semibold text-red-200">Danger zone</h2>
    <p class="text-xs text-red-100/80">
      Deleting this option will remove it from any tours that use it. This cannot be undone.
    </p>

    <form method="POST" action="?/delete" class="mt-2">
      <button
        type="submit"
        class="px-4 py-2 rounded-lg bg-red-600 text-slate-50 text-sm font-semibold hover:bg-red-500"
      >
        Delete option
      </button>
    </form>
  </section>
</div>