<!-- src/routes/guide/+layout.svelte -->
<script lang="ts">
  export let data: {
    guideUser: {
      id: string;
      email: string;
      name: string | null;
    };
  };

  const guide = data.guideUser;
</script>

<div class="page-shell space-y-6">
  <!-- Header -->
  <header class="page-header">
    <div>
      <h1 class="page-title">Guide dashboard</h1>
      <p class="page-subtitle">
        Welcome{guide?.name ? `, ${guide.name}` : ""}. View and manage your assigned tours.
      </p>
    </div>

    <div class="flex flex-wrap gap-2 text-sm">
      <a href="/guide" class="btn-secondary">
        Overview
      </a>
      <a href="/account" class="btn-ghost">
        My customer account
      </a>
    </div>
  </header>

  <!-- Child pages render here -->
  <slot />
</div>