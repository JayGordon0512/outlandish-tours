<script lang="ts">
  import { onMount } from "svelte";
  import { createClient } from "@supabase/supabase-js";
  import {
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  } from "$env/static/public";

  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });

  let password = "";
  let confirmPassword = "";
  let loading = false;
  let error: string | null = null;
  let success: string | null = null;
  let hasSession = false;

  onMount(async () => {
    const { data, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error getting session on reset page:", sessionError);
    }

    if (data?.session) {
      hasSession = true;
    } else {
      error =
        "Your reset link may have expired or is invalid. Please request a new password reset.";
    }
  });

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    error = null;
    success = null;

    if (!hasSession) {
      error =
        "Your reset link is no longer valid. Please request a new password reset.";
      return;
    }

    if (!password || !confirmPassword) {
      error = "Please fill in both password fields.";
      return;
    }

    if (password.length < 8) {
      error = "Password should be at least 8 characters.";
      return;
    }

    if (password !== confirmPassword) {
      error = "Passwords do not match.";
      return;
    }

    loading = true;

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        password
      });

      if (updateError) {
        console.error("Error updating password:", updateError);
        error =
          "We couldn’t update your password. Your reset link may have expired. Please request a new one.";
      } else if (data.user) {
        success = "Your password has been updated.";

        // Auto redirect back to login
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2500);
      } else {
        error =
          "Something unexpected happened. Please try again or request a new reset link.";
      }
    } catch (e) {
      console.error("Unexpected error updating password:", e);
      error =
        "We couldn’t update your password just now. Please try again in a moment.";
    } finally {
      loading = false;
    }
  };
</script>

<svelte:head>
  <title>Reset password · Outlandish Tours</title>
</svelte:head>

<div class="page-shell max-w-md space-y-6">
  <header class="space-y-1">
    <h1 class="page-title">Reset your password</h1>
    <p class="page-subtitle">
      Choose a new password for your Outlandish account.
    </p>
  </header>

  <form class="card space-y-4" on:submit|preventDefault={handleSubmit}>
    {#if error}
      <p class="text-sm" style="color: var(--danger);">
        {error}
      </p>
    {/if}

    {#if success}
      <div class="space-y-2">
        <p class="text-sm">
          {success}<br />
          Redirecting you to login…
        </p>
        <a href="/auth/login" class="text-meta hover:underline">
          Click here if you are not redirected
        </a>
      </div>
    {/if}

    {#if !success}
      <div class="space-y-2">
        <label for="password" class="field-label">New password</label>
        <input
          id="password"
          type="password"
          class="input"
          bind:value={password}
          minlength="8"
          required
        />
        <p class="text-meta">At least 8 characters recommended.</p>
      </div>

      <div class="space-y-2">
        <label for="confirmPassword" class="field-label">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          type="password"
          class="input"
          bind:value={confirmPassword}
          minlength="8"
          required
        />
      </div>

      <div class="flex items-center justify-between pt-2">
        <a href="/auth/login" class="text-meta hover:underline">
          Back to login
        </a>

        <button type="submit" class="btn-primary" disabled={loading}>
          {#if loading}
            Updating...
          {:else}
            Update password
          {/if}
        </button>
      </div>
    {/if}
  </form>
</div>