<script lang="ts">
  export let data: any;

  const upcomingBookings = data?.upcomingBookings ?? [];
  const pastBookings = data?.pastBookings ?? [];

  const formatBookingRef = (id?: string) => {
    if (!id) return "—";
    const clean = id.replace(/[^A-Za-z0-9]/g, "");
    const short = clean.slice(-6).toUpperCase();
    return `OT-${short}`;
  };

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };
</script>

<div class="page-shell space-y-8">
  <header class="page-header">
    <div>
      <h1 class="page-title">My trips</h1>
      <p class="page-subtitle">
        View and manage your Outlandish bookings.
      </p>
    </div>
  </header>

  <!-- Upcoming bookings -->
  <section class="space-y-3">
    <h2 class="text-sm font-semibold">Upcoming bookings</h2>

    {#if !upcomingBookings.length}
      <div class="card">
        <p class="text-sm text-muted">
          You don't have any upcoming bookings yet.
        </p>
      </div>
    {:else}
      <div class="table-shell">
        <table class="table">
          <thead>
            <tr class="table-head-row">
              <th class="table-head-cell">Booking</th>
              <th class="table-head-cell">Tour</th>
              <th class="table-head-cell">Date</th>
              <th class="table-head-cell">Guests</th>
              <th class="table-head-cell">Status</th>
              <th class="table-head-cell text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each upcomingBookings as booking}
              <tr class="table-row">
                <!-- Booking ref -->
                <td class="table-cell">
                  <div class="flex flex-col gap-0.5">
                    <span class="font-semibold">
                      {formatBookingRef(booking.id)}
                    </span>
                    <span class="text-meta mono">
                      {booking.id}
                    </span>
                  </div>
                </td>

                <!-- Tour -->
                <td class="table-cell">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-sm font-medium">
                      {booking.tourTitle ?? booking.Tour?.title ?? "Tour"}
                    </span>
                  </div>
                </td>

                <!-- Date -->
                <td class="table-cell text-sm">
                  {formatDate(booking.startDate ?? booking.createdAt)}
                </td>

                <!-- Guests -->
                <td class="table-cell text-sm">
                  {booking.guests ?? "—"}
                </td>

                <!-- Status -->
                <td class="table-cell">
                  {#if booking.status === "confirmed"}
                    <span class="badge badge-active">
                      Confirmed
                    </span>
                  {:else if booking.status === "cancel_requested"}
                    <span class="badge badge-muted">
                      Cancellation requested
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

                <!-- Actions -->
                <td class="table-cell-right">
                  <a
                    href={`/account/bookings/${booking.id}`}
                    class="btn-secondary btn-xs"
                  >
                    Manage booking
                  </a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>

  <!-- Past bookings (optional, same status logic) -->
  <section class="space-y-3">
    <h2 class="text-sm font-semibold">Past bookings</h2>

    {#if !pastBookings.length}
      <div class="card">
        <p class="text-sm text-muted">
          No past bookings yet.
        </p>
      </div>
    {:else}
      <div class="table-shell">
        <table class="table">
          <thead>
            <tr class="table-head-row">
              <th class="table-head-cell">Booking</th>
              <th class="table-head-cell">Tour</th>
              <th class="table-head-cell">Date</th>
              <th class="table-head-cell">Guests</th>
              <th class="table-head-cell">Status</th>
              <th class="table-head-cell text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each pastBookings as booking}
              <tr class="table-row">
                <td class="table-cell">
                  <div class="flex flex-col gap-0.5">
                    <span class="font-semibold">
                      {formatBookingRef(booking.id)}
                    </span>
                    <span class="text-meta mono">
                      {booking.id}
                    </span>
                  </div>
                </td>
                <td class="table-cell">
                  <span class="text-sm font-medium">
                    {booking.tourTitle ?? booking.Tour?.title ?? "Tour"}
                  </span>
                </td>
                <td class="table-cell text-sm">
                  {formatDate(booking.startDate ?? booking.createdAt)}
                </td>
                <td class="table-cell text-sm">
                  {booking.guests ?? "—"}
                </td>
                <td class="table-cell">
                  {#if booking.status === "confirmed"}
                    <span class="badge badge-active">
                      Confirmed
                    </span>
                  {:else if booking.status === "cancel_requested"}
                    <span class="badge badge-muted">
                      Cancellation requested
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
                <td class="table-cell-right">
                  <a
                    href={`/account/bookings/${booking.id}`}
                    class="btn-secondary btn-xs"
                  >
                    View
                  </a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
</div>