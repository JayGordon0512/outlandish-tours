<script lang="ts">
  export let form: any;

  const uploadError = form?.uploadError ?? null;
  const uploadedPhotoUrl = form?.uploadedPhotoUrl ?? null;
  const fieldErrors = form?.fieldErrors ?? {};
  const values = form?.values ?? {};
  const generalError = form?.error ?? null;
</script>

<div class="page-shell space-y-6">
  <header class="page-header">
    <div>
      <h1 class="page-title">New guide</h1>
      <p class="page-subtitle">
        Create a new guide profile. You can upload a photo and store contact details.
      </p>
    </div>

    <a href="/admin/guides" class="btn-secondary">
      Back to guides
    </a>
  </header>

  {#if generalError}
    <div class="card-danger text-sm">
      {generalError}
    </div>
  {/if}

  <div class="grid md:grid-cols-3 gap-6">
    <!-- PHOTO UPLOAD COLUMN -->
    <div class="card space-y-3 md:col-span-1">
      <h2 class="text-sm font-semibold">Guide photo</h2>
      <p class="text-meta">
        Upload a portrait image for this guide. This will appear on admin and (optionally)
        front-end pages.
      </p>

      {#if uploadError}
        <p class="text-meta" style="color: var(--danger);">
          {uploadError}
        </p>
      {/if}

      {#if uploadedPhotoUrl}
        <div class="mt-2">
          <img
            src={uploadedPhotoUrl}
            alt="Guide photo preview"
            class="w-full max-w-[220px] rounded-lg border"
          />
          <p class="text-meta mt-1">Preview of uploaded photo.</p>
        </div>
      {/if}

      <form
        method="POST"
        enctype="multipart/form-data"
        action="?/uploadPhoto"
        class="space-y-3"
      >
        <div class="space-y-1">
          <label class="field-label" for="photo">
            Upload new photo
          </label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            class="block w-full text-sm"
          />
        </div>

        <button type="submit" class="btn-secondary btn-sm">
          Upload photo
        </button>
      </form>
    </div>

    <!-- MAIN FORM COLUMN -->
    <form
      method="POST"
      action="?/createGuide"
      class="card space-y-4 md:col-span-2"
    >
      <h2 class="text-sm font-semibold">Guide details</h2>

      <!-- Hidden photoUrl from upload action -->
      <input
        type="hidden"
        name="photoUrl"
        value={uploadedPhotoUrl ?? values.photoUrl ?? ""}
      />

      <div class="grid md:grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="field-label" for="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            class="input"
            value={values.firstName ?? ""}
          />
          {#if fieldErrors.firstName}
            <p class="text-meta" style="color: var(--danger);">
              {fieldErrors.firstName}
            </p>
          {/if}
        </div>

        <div class="space-y-1">
          <label class="field-label" for="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            class="input"
            value={values.lastName ?? ""}
          />
          {#if fieldErrors.lastName}
            <p class="text-meta" style="color: var(--danger);">
              {fieldErrors.lastName}
            </p>
          {/if}
        </div>
      </div>

      <div class="space-y-1">
        <label class="field-label" for="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          class="input"
          value={values.email ?? ""}
        />
        {#if fieldErrors.email}
          <p class="text-meta" style="color: var(--danger);">
            {fieldErrors.email}
          </p>
        {/if}
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="field-label" for="mobile">Mobile</label>
          <input
            id="mobile"
            name="mobile"
            class="input"
            value={values.mobile ?? ""}
          />
        </div>

        <div class="space-y-1">
          <label class="field-label" for="address">Address</label>
          <textarea
            id="address"
            name="address"
            class="textarea"
            rows="3"
          >{values.address ?? ""}</textarea>
        </div>
      </div>

      <div class="flex items-center gap-2 pt-2">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          class="checkbox"
          checked={values.isActive ?? true}
        />
        <label for="isActive" class="text-sm">
          Active guide (available for assignment)
        </label>
      </div>

      <div class="flex items-center justify-end gap-2 pt-4">
        <a href="/admin/guides" class="btn-ghost btn-sm">
          Cancel
        </a>
        <button type="submit" class="btn-primary btn-sm">
          Save guide
        </button>
      </div>
    </form>
  </div>
</div>