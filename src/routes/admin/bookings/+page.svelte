<!-- src/routes/admin/bookings/+page.svelte -->
<script lang="ts">
  export let data: any;

  const { bookings, guides, guideFilter, error } = data;

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
      month: "2-digit",
      year: "2-digit"
    });
  };

  const formatStatus = (status?: string | null) => status ?? "pending";

  const formatCustomerName = (booking: any) => {
    // Prefer denormalised fields if you add them later, but for now use the join
    if (booking.User && (booking.User.name || booking.User.email)) {
      return booking.User.name || booking.User.email;
    }
    return booking.customerName ?? "Unknown customer";
  };

  const formatCustomerEmail = (booking: any) => {
    if (booking.User && booking.User.email) return booking.User.email;
    return booking.customerEmail ?? "—";
  };

  const formatTourName = (booking: any) => {
    if (booking.Tour && booking.Tour.title) return booking.Tour.title;
    return booking.tourName ?? "Unknown tour";
  };

  const formatGuideName = (booking: any) => {
    if (booking.Guide) {
      const g = booking.Guide;
      const full = [g.firstName, g.lastName].filter(Boolean).join(" ");
      if (full) return full;
    }
    return "No guide assigned";
  };

  const formatGuideCode = (booking: any) => {
    // If your guide IDs are now friendly like G-XXXXXX, show that
    if (booking.Guide && booking.Guide.id) {
      return booking.Guide.id as string;
    }
    return "";
  };

  const hasBookings = bookings && bookings.length > 0;
</script>

<div class="page-shell space-y-6">
  <!-- Header -->
  <header class="page-header">
    <div>
      <h1 class="page-title">Bookings</h1>
      <p class="page-subtitle">
        Admin view of all bookings with customer, tour and guide details.
      </p>
    </div>

    <!-- Guide filter -->
    <form method="GET" class="flex items-center gap-2 text-sm">
      <label class="field-label" for="guideFilter">
        Filter by guide
      </label>
      <select
        id="guideFilter"
        name="guideId"
        class="select"
        value={guideFilter}
        on:change={(e) => {
          const form = e.currentTarget.form;
          if (form) form.submit();
        }}
      >
        <option value="all">All guides</option>
        {#each guides as guide}
          <option value={guide.id} selected={guideFilter === guide.id}>
            {[guide.firstName, guide.lastName].filter(Boolean).join(" ") || guide.id}
          </option>
        {/each}
      </select>
    </form>
  </header>

  {#if error}
    <div class="card-danger text-sm">
      {error}
    </div>
  {/if}

  {#if !hasBookings}
    <div class="card text-sm">
      No bookings found.
    </div>
  {:else}
    <section class="table-shell">
      <table class="table">
        <thead>
          <tr class="table-head-row">
            <th class="table-head-cell">Booking</th>
            <th class="table-head-cell">Customer</th>
            <th class="table-head-cell">Tour</th>
            <th class="table-head-cell">Guide</th>
            <th class="table-head-cell">Date</th>
            <th class="table-head-cell">Status</th>
            <th class="table-head-cell text-right">Total</th>
            <th class="table-head-cell text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each bookings as booking}
            <tr class="table-row">
              <!-- Booking reference -->
              <td class="table-cell align-top">
                <div class="flex flex-col gap-0.5">
                  <span class="text-sm font-semibold">
                    {formatBookingRef(booking.id)}
                  </span>
                  <span class="text-meta">
                    Guests: {booking.guests ?? "—"}
                  </span>
                  <!-- If you ever want raw ID back, you can add it here as text-meta -->
                </div>
              </td>

              <!-- Customer -->
              <td class="table-cell align-top">
                <div class="flex flex-col gap-0.5 text-sm">
                  <span class="font-medium">
                    {formatCustomerName(booking)}
                  </span>
                  <span class="text-meta">
                    {formatCustomerEmail(booking)}
                  </span>
                </div>
              </td>

              <!-- Tour -->
              <td class="table-cell align-top">
                <div class="flex flex-col gap-0.5 text-sm">
                  <span class="font-medium">
                    {formatTourName(booking)}
                  </span>
                </div>
              </td>

              <!-- Guide -->
              <td class="table-cell align-top">
                <div class="flex flex-col gap-0.5 text-sm">
                  <span>
                    {formatGuideName(booking)}
                  </span>
                  {#if formatGuideCode(booking)}
                    <span class="text-meta">
                      {formatGuideCode(booking)}
                    </span>
                  {/if}
                </div>
              </td>

              <!-- Date -->
              <td class="table-cell align-top text-sm">
                {formatDate(booking.startDate ?? booking.createdAt)}
              </td>

              <!-- Status -->
              <td class="table-cell align-top">
                {#if formatStatus(booking.status) === "confirmed"}
                  <span class="badge badge-active">
                    Confirmed
                  </span>
                {:else if formatStatus(booking.status) === "cancelled"}
                  <span class="badge badge-inactive">
                    Cancelled
                  </span>
                {:else if formatStatus(booking.status) === "cancel_requested"}
                  <span class="badge badge-featured">
                    Cancel requested
                  </span>
                {:else}
                  <span class="badge badge-muted">
                    {formatStatus(booking.status)}
                  </span>
                {/if}
              </td>

              <!-- Total -->
              <td class="table-cell table-cell-right align-top">
                {#if typeof booking.totalAmount === "number"}
                  £{booking.totalAmount.toFixed(2)}
                {:else}
                  —
                {/if}
              </td>

              <!-- Actions -->
              <td class="table-cell table-cell-right align-top">
                <a
                  href={`/admin/bookings/${booking.id}`}
                  class="btn-ghost btn-xs"
                >
                  View
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/if}
</div>