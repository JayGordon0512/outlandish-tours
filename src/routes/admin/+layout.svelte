<!-- src/routes/admin/+layout.svelte -->
<script lang="ts">
  export let data: any;
  const admin = data?.admin ?? null;

  const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/tours", label: "Tours" },
  { href: "/admin/options", label: "Options" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/guides", label: "Guides" },
  { href: "/admin/home", label: "Home CMS" }
];</script>

<div class="page-shell space-y-6">
  <header class="page-header">
    <div>
      <h1 class="page-title">Admin</h1>
      <p class="page-subtitle">
        {admin?.name ? `Signed in as ${admin.name}` : admin?.email}
      </p>
    </div>

    <form method="POST" action="/auth/logout">
      <button type="submit" class="btn-ghost btn-sm">Logout</button>
    </form>
  </header>

  <nav class="card flex flex-wrap gap-2">
    {#each nav as item}
      <a href={item.href} class="btn-secondary btn-sm">{item.label}</a>
    {/each}
  </nav>

  <slot />
</div>