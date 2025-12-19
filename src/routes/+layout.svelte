<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import "../app.css";

  export let data: {
    user: {
      id: string;
      email: string;
      name: string | null;
      isAdmin?: boolean;
      isGuide?: boolean;
    } | null;
  };

  const user = data?.user ?? null;
  console.log("LAYOUT.SVELTE: user =", user);
</script>
<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
  // ...leave everything else as-is
</script><svelte:head>
  <title>Outlandish Tours</title>
</svelte:head>

<div
  class="min-h-screen flex flex-col"
  style="background-color: var(--bg-page); color: var(--text-main);"
>
  <!-- Global header -->
  <header
    class="border-b"
    style="background-color: var(--bg-surface); border-color: var(--border-subtle);"
  >
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
      <!-- Brand -->
      <a href="/" class="flex items-center gap-2">
        <div
          class="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
          style="background-color: var(--accent-soft); color: var(--ink); border: 1px solid var(--accent);"
        >
          O
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-semibold tracking-wide">
            Outlandish Tours
          </span>
          <span class="text-[11px] text-muted">
            Highlands · Skye · Outlander
          </span>
        </div>
      </a>

      <!-- Main nav -->
      <nav class="flex items-center gap-4 text-sm">
        <a href="/tours" class="hover:underline">Tours</a>
        <a href="/about" class="hidden sm:inline hover:underline">About</a>

        {#if user}
          {#if user.isGuide}
            <a
              href="/guide"
              class="btn-secondary text-xs uppercase tracking-wide"
            >
              Guide
            </a>
          {/if}

          {#if user.isAdmin}
            <a
              href="/admin"
              class="btn-secondary text-xs uppercase tracking-wide"
            >
              Admin
            </a>
          {/if}

          <form method="POST" action="/auth/logout">
            <button
              type="submit"
              class="btn-ghost text-xs uppercase tracking-wide"
            >
              Logout
            </button>
          </form>
        {:else}
          <a
            href="/auth/login"
            class="btn-secondary text-xs uppercase tracking-wide"
          >
            Login
          </a>
        {/if}
      </nav>
    </div>
  </header>

  <!-- Page content -->
  <main class="flex-1">
    <slot />
  </main>
<Footer />
  </div>