<script lang="ts">
  export let form: any = {};
</script>

<div class="max-w-3xl mx-auto px-4 py-10 space-y-6">
  <header class="flex items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-semibold">New extra option</h1>
      <p class="text-sm text-slate-400 mt-1">
        Create an add-on that can be attached to one or more tours.
      </p>
    </div>
    <a
      href="/admin/options"
      class="text-sm underline underline-offset-2 hover:no-underline text-slate-300"
    >
      ← Back to options
    </a>
  </header>

  <form
    method="POST"
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
        placeholder="Whisky tasting"
        value={form?.values?.name ?? ""}
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
      >{form?.values?.description ?? ""}</textarea>
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
          placeholder="25"
          value={form?.values?.price ?? ""}
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
            selected={form?.values?.chargeType !== "PerTour"}
          >
            Per person
          </option>
          <option
            value="PerTour"
            selected={form?.values?.chargeType === "PerTour"}
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
          <option value="1" selected={form?.values?.isActive !== "0"}>
            Active
          </option>
          <option value="0" selected={form?.values?.isActive === "0"}>
            Inactive
          </option>
        </select>
      </div>
    </div>

    <div class="flex justify-end gap-3 text-sm">
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
        Create option
      </button>
    </div>
  </form>
</div>