<!-- src/routes/guide/+page.svelte -->
<script lang="ts">
  export let data: any;

  const { guide, upcomingBookings, pastBookings } = data;

  const formatDateTime = (value?: string) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit"
    });
  };

  const formatBookingRef = (id?: string) => {
    if (!id) return "—";
    const clean = id.replace(/[^A-Za-z0-9]/g, "");
    const short = clean.slice(-6).toUpperCase();
    return `OT-${short}`;
  };

  const formatMoney = (value?: number | null) => {
    if (value === null || value === undefined) return "—";
    return `£${value}`;
  };

  const fullGuideName = `${guide?.firstName ?? ""} ${guide?.lastName ?? ""}`.trim();
</script>

<div class="page-shell space-y-6">
  <!-- Header -->
  <header class="page-header">
    <div>
      <h1 class="page-title">
        {fullGuideName ? `Welcome, ${fullGuideName}` : "Guide dashboard"}
      </h1>
      <p class="page-subtitle">
        View your upcoming tours, guests and pickup details.
      </p>
    </div>

    <div class="flex flex-wrap gap-2 text-sm">
      <span class="badge badge-active">
        Guide portal
      </span>
    </div>
  </header>

  <!-- Summary cards -->
  <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div class="card-tight">
      <div class="text-meta uppercase tracking-wide">Upcoming tours</div>
      <div class="mt-1 text-lg font-semibold">
        {upcomingBookings?.length ?? 0}
      </div>
    </div>

    <div class="card-tight">
      <div class="text-meta uppercase tracking-wide">Recent tours shown</div>
      <div class="mt-1 text-lg font-semibold">
        {pastBookings?.length ?? 0}
      </div>
    </div>

    <div class="card-tight">
      <div class="text-meta uppercase tracking-wide">Email</div>
      <div class="mt-1 text-sm">
        {guide?.email ?? guide?.User?.email ?? "—"}
      </div>
    </div>
  </section>

  <!-- Upcoming bookings -->
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-sm font-semibold">
        Upcoming tours
      </h2>
    </div>

    {#if !upcomingBookings || upcomingBookings.length === 0}
      <div class="card text-sm text-muted">
        You don’t have any upcoming tours assigned yet.
      </div>
    {:else}
      <div class="table-shell">
        <table class="table">
          <thead class="table-head-row">
            <tr>
              <th class="table-head-cell">Booking</th>
              <th class="table-head-cell">Tour</th>
              <th class="table-head-cell">Guests</th>
              <th class="table-head-cell">Pickup</th>
              <th class="table-head-cell">Date</th>
              <th class="table-head-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {#each upcomingBookings as booking}
              <tr class="table-row">
                <!-- Booking ref + customer -->
                <td class="table-cell">
                  <div class="space-y-1">
                    <div class="font-semibold">
                      {formatBookingRef(booking.id)}
                    </div>
                    <div class="text-meta">
                      {booking.customerName ?? booking.User?.name ?? "Customer"}
                    </div>
                  </div>
                </td>

                <!-- Tour -->
                <td class="table-cell">
                  <div class="space-y-1">
                    <div class="text-sm font-medium">
                      {booking.Tour?.title ?? "Tour"}
                    </div>
                    {#if booking.Tour?.durationDays}
                      <div class="text-meta">
                        {booking.Tour.durationDays} day{booking.Tour.durationDays === 1 ? "" : "s"}
                      </div>
                    {/if}
                  </div>
                </td>

                <!-- Guests -->
                <td class="table-cell">
                  <div class="text-sm">
                    {booking.guests ?? 0}
                  </div>
                  <div class="text-meta">
                    Guests
                  </div>
                </td>

                <!-- Pickup -->
                <td class="table-cell">
                  <div class="text-sm">
                    {booking.pickupLocation ?? "Not set"}
                  </div>
                  {#if booking.pickupTime}
                    <div class="text-meta">
                      {booking.pickupTime}
                    </div>
                  {/if}
                </td>

                <!-- Date -->
                <td class="table-cell">
                  <div class="text-sm">
                    {formatDate(booking.startDate ?? booking.createdAt)}
                  </div>
                  <div class="text-meta">
                    {formatDateTime(booking.startDate ?? booking.createdAt)}
                  </div>
                </td>

                <!-- Status -->
                <td class="table-cell">
                  {#if booking.status === "confirmed"}
                    <span class="badge badge-active">
                      Confirmed
                    </span>
                  {:else if booking.status === "cancel_requested"}
                    <span class="badge" style="border-color: var(--danger); color: var(--danger);">
                      Cancel requested
                    </span>
                  {:else if booking.status === "cancelled"}
                    <span class="badge badge-inactive">
                      Cancelled
                    </span>
                  {:else}
                    <span class="badge badge-muted">
                      {booking.status ?? "Pending"}
                    </span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>

  <!-- Past bookings -->
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-sm font-semibold">
        Recent tours
      </h2>
      {#if pastBookings && pastBookings.length > 0}
        <span class="text-meta">
          Showing latest {pastBookings.length}
        </span>
      {/if}
    </div>

    {#if !pastBookings || pastBookings.length === 0}
      <div class="card text-sm text-muted">
        Past tours will appear here after you complete your first assignments.
      </div>
    {:else}
      <div class="table-shell">
        <table class="table">
          <thead class="table-head-row">
            <tr>
              <th class="table-head-cell">Booking</th>
              <th class="table-head-cell">Tour</th>
              <th class="table-head-cell">Guests</th>
              <th class="table-head-cell">Date</th>
              <th class="table-head-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {#each pastBookings as booking}
              <tr class="table-row">
                <td class="table-cell">
                  <div class="space-y-1">
                    <div class="font-semibold">
                      {formatBookingRef(booking.id)}
                    </div>
                    <div class="text-meta">
                      {booking.customerName ?? booking.User?.name ?? "Customer"}
                    </div>
                  </div>
                </td>

                <td class="table-cell">
                  <div class="text-sm font-medium">
                    {booking.Tour?.title ?? "Tour"}
                  </div>
                </td>

                <td class="table-cell">
                  <div class="text-sm">
                    {booking.guests ?? 0}
                  </div>
                  <div class="text-meta">
                    Guests
                  </div>
                </td>

                <td class="table-cell">
                  <div class="text-sm">
                    {formatDate(booking.startDate ?? booking.createdAt)}
                  </div>
                </td>

                <td class="table-cell">
                  {#if booking.status === "confirmed"}
                    <span class="badge badge-active">
                      Confirmed
                    </span>
                  {:else if booking.status === "cancelled"}
                    <span class="badge badge-inactive">
                      Cancelled
                    </span>
                  {:else}
                    <span class="badge badge-muted">
                      {booking.status ?? "Pending"}
                    </span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
</div>