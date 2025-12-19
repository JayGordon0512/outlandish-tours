<script lang="ts">
  export let form: any;
  const error = form?.error as string | undefined;
  const fieldErrors = form?.fieldErrors ?? {};
  const values = form?.values ?? {};
</script>

<svelte:head>
  <title>Login · Outlandish Tours</title>
</svelte:head>

<div class="page-shell max-w-md space-y-6">
  <header class="space-y-1">
    <h1 class="page-title">Log in to your account</h1>
    <p class="page-subtitle">
      View your bookings and keep your details up to date.
    </p>
  </header>

  <form method="POST" class="card space-y-4">
    {#if error}
      <p class="text-sm" style="color: var(--danger);">
        {error}
      </p>
    {/if}

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
      {#if fieldErrors.email}
        <p class="text-meta" style="color: var(--danger);">
          {fieldErrors.email}
        </p>
      {/if}
    </div>

    <div class="space-y-2">
      <label for="password" class="field-label">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        class="input"
        required
      />
      {#if fieldErrors.password}
        <p class="text-meta" style="color: var(--danger);">
          {fieldErrors.password}
        </p>
      {/if}
    </div>

    <div class="flex items-center justify-between pt-2">
      <div class="text-meta">
        <a href="/auth/forgot" class="hover:underline">
          Forgot your password?
        </a>
      </div>

      <button type="submit" class="btn-primary">
        Log in
      </button>
    </div>
  </form>
</div>