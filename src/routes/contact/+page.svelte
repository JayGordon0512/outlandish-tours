<!-- src/routes/contact/+page.svelte -->
<script lang="ts">
  export let data: any;
  export let form: any;

  const ok = form?.ok ?? false;
  const values = form?.values ?? { name: "", email: "", subject: "", message: "" };
  const fieldErrors = form?.fieldErrors ?? {};
  const error = form?.error ?? null;
</script>

<svelte:head>
  <title>Contact | Outlandish Tours</title>
</svelte:head>

<div class="page-shell space-y-6">
  <header class="page-header">
    <div>
      <h1 class="page-title">Contact</h1>
      <p class="page-subtitle">Send us a message and we’ll get back to you.</p>
    </div>
  </header>

  {#if ok}
    <div class="card">
      <p class="text-sm">Thanks — your message has been sent.</p>
    </div>
  {:else}
    {#if error}
      <div class="card-danger text-sm">{error}</div>
    {/if}

    <form method="POST" class="card space-y-4">
      <!-- Honeypot -->
      <input type="text" name="company" tabindex="-1" autocomplete="off" class="hidden" />

      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-1">
          <label class="field-label" for="name">Name</label>
          <input id="name" name="name" class="input" value={values.name} aria-invalid={fieldErrors.name ? "true" : "false"} />
          {#if fieldErrors.name}<p class="text-xs text-red-600">{fieldErrors.name}</p>{/if}
        </div>

        <div class="space-y-1">
          <label class="field-label" for="email">Email</label>
          <input id="email" name="email" class="input" type="email" value={values.email} aria-invalid={fieldErrors.email ? "true" : "false"} />
          {#if fieldErrors.email}<p class="text-xs text-red-600">{fieldErrors.email}</p>{/if}
        </div>
      </div>

      <div class="space-y-1">
        <label class="field-label" for="subject">Subject (optional)</label>
        <input id="subject" name="subject" class="input" value={values.subject} />
      </div>

      <div class="space-y-1">
        <label class="field-label" for="message">Message</label>
        <textarea id="message" name="message" class="textarea" rows="6">{values.message}</textarea>
        {#if fieldErrors.message}<p class="text-xs text-red-600">{fieldErrors.message}</p>{/if}
      </div>

      <div class="flex justify-end">
        <button type="submit" class="btn-primary btn-sm">Send message</button>
      </div>
    </form>
  {/if}
</div>