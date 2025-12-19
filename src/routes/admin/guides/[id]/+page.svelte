<!-- src/routes/admin/guides/[id]/+page.svelte -->
<script lang="ts">
  import type { ActionData } from "./$types";

  export let data: any;
  export let form: ActionData | undefined;

  const guide = data.guide;

  const values = form?.values ?? {
    firstName: guide.firstName ?? "",
    lastName: guide.lastName ?? "",
    email: guide.email ?? "",
    mobile: guide.mobile ?? "",
    address: guide.address ?? ""
  };

  const fieldErrors = form?.fieldErrors ?? {};
  const generalError = form?.error ?? null;

  const fullName = (g: any) =>
    [g.firstName, g.lastName].filter(Boolean).join(" ");
</script>

<div class="page-shell space-y-6">
  <header class="page-header">
    <div>
      <h1 class="page-title">
        Edit guide
      </h1>
      <p class="page-subtitle">
        Update details for {fullName(guide) || "this guide"}.
      </p>
    </div>

    <a href="/admin/guides" class="btn-secondary btn-sm">
      Back to guides
    </a>
  </header>

  <div class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
    <!-- Edit form -->
    <form method="POST" class="card space-y-5">
      {#if generalError}
        <div class="card-danger text-sm">
          {generalError}
        </div>
      {/if}

      <!-- Name -->
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-1">
          <label for="firstName" class="field-label">First name</label>
          <input
            id="firstName"
            name="firstName"
            class="input"
            value={values.firstName}
          />
          {#if fieldErrors.firstName}
            <p class="text-meta" style="color: #b73a3a;">
              {fieldErrors.firstName}
            </p>
          {/if}
        </div>

        <div class="space-y-1">
          <label for="lastName" class="field-label">Last name</label>
          <input
            id="lastName"
            name="lastName"
            class="input"
            value={values.lastName}
          />
          {#if fieldErrors.lastName}
            <p class="text-meta" style="color: #b73a3a;">
              {fieldErrors.lastName}
            </p>
          {/if}
        </div>
      </div>

      <!-- Contact -->
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-1">
          <label for="email" class="field-label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            class="input"
            value={values.email}
          />
          {#if fieldErrors.email}
            <p class="text-meta" style="color: #b73a3a;">
              {fieldErrors.email}
            </p>
          {/if}
        </div>

        <div class="space-y-1">
          <label for="mobile" class="field-label">Mobile</label>
          <input
            id="mobile"
            name="mobile"
            class="input"
            value={values.mobile}
          />
        </div>
      </div>

      <!-- Address -->
      <div class="space-y-1">
        <label for="address" class="field-label">Address</label>
        <textarea
          id="address"
          name="address"
          class="textarea"
          rows="3"
        >{values.address}</textarea>
      </div>

      <div class="flex justify-between items-center pt-2">
        <div class="text-meta">
          Guide ID: <span class="mono">{guide.id}</span>
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            formaction="?/save"
            class="btn-primary btn-sm"
          >
            Save changes
          </button>
        </div>
      </div>
    </form>

    <!-- Sidebar: photo & delete -->
    <div class="space-y-4">
      <!-- Guide profile + change photo -->
      <div class="card space-y-3">
        <h2 class="text-sm font-semibold">Guide profile</h2>

        <div class="flex items-center gap-3">
          {#if guide.photoUrl}
            <img
              src={guide.photoUrl}
              alt={fullName(guide) || "Guide photo"}
              class="h-14 w-14 rounded-full object-cover border border-[rgba(0,0,0,0.08)]"
            />
          {:else}
            <div
              class="h-14 w-14 rounded-full flex items-center justify-center text-base font-semibold"
              style="background-color: var(--accent-soft); color: var(--ink);"
            >
              {(guide.firstName?.[0] ?? "G").toUpperCase()}
            </div>
          {/if}

          <div>
            <div class="text-sm font-semibold">
              {fullName(guide) || "Unnamed guide"}
            </div>
            <div class="text-meta">
              {guide.email}
            </div>
          </div>
        </div>

        <!-- Change photo form -->
        <form method="POST" enctype="multipart/form-data" class="space-y-2 text-sm">
          <input type="hidden" name="/?_action" value="updatePhoto" />
          <label class="field-label">Change profile photo</label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            class="block w-full text-sm"
          />
          <p class="text-meta">
            JPG or PNG, up to a few MB.
          </p>
          <button type="submit" formaction="?/updatePhoto" class="btn-secondary btn-sm">
            Upload new photo
          </button>
        </form>
      </div>

      <!-- Danger zone -->
      <div class="card-danger space-y-3">
        <h2 class="text-sm font-semibold">Danger zone</h2>
        <p class="text-sm">
          Deleting this guide is permanent. You may need to unlink them from any
          future bookings first.
        </p>

        <form
          method="POST"
          on:submit|preventDefault={(e) => {
            if (confirm("Delete this guide? This cannot be undone.")) {
              (e.target as HTMLFormElement).submit();
            }
          }}
        >
          <button
            type="submit"
            formaction="?/delete"
            class="btn-danger btn-sm"
          >
            Delete guide
          </button>
        </form>
      </div>
    </div>
  </div>
</div>