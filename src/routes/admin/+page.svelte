<script lang="ts">
  const stats = [
    { label: "Bookings (today)", value: 3 },
    { label: "Bookings (this week)", value: 24 },
    { label: "Upcoming tours", value: 7 },
    { label: "Revenue (this month)", value: "£7,320" }
  ];
</script>

<div class="page-shell space-y-8">
  <header class="page-header">
    <div>
      <h1 class="page-title">Admin dashboard</h1>
      <p class="page-subtitle">
        High-level view of Outlandish operations. Data is placeholder for now.
      </p>
    </div>
  </header>

  <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
    {#each stats as stat}
      <div class="card-tight">
        <div class="text-meta uppercase tracking-wide">
          {stat.label}
        </div>
        <div class="mt-1 text-lg font-semibold">
          {stat.value}
        </div>
      </div>
    {/each}
  </section>
</div>