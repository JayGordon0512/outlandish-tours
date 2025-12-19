<script lang="ts">
  export let form: any;
  const error = form?.error as string | undefined;
  const fieldErrors = form?.fieldErrors ?? {};
  const values = form?.values ?? {};
  const sent = form?.sent ?? false;
</script>

<svelte:head>
  <title>Forgot password · Outlandish Tours</title>
</svelte:head>

<div class="page-shell max-w-md space-y-6">
  <header class="space-y-1">
    <h1 class="page-title">Forgot your password?</h1>
    <p class="page-subtitle">
      Enter the email you used to book and we’ll send you a reset link.
    </p>
  </header>

  <form method="POST" class="card space-y-4">
    {#if error}
      <p class="text-sm" style="color: var(--danger);">
        {error}
      </p>
    {/if}

    {#if sent}
      <p class="text-sm">
        If an account exists for <strong>{values.email}</strong>, we’ve sent a password
        reset email. Please check your inbox and follow the link.
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

    <div class="flex items-center justify-between pt-2">
      <a href="/auth/login" class="text-meta hover:underline">
        Back to login
      </a>
      <button type="submit" class="btn-primary">
        Send reset link
      </button>
    </div>
  </form>
</div>