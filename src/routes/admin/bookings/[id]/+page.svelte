<script lang="ts">
  export let data: any;

  const { booking, guides = [], guideUpdated = false } = data;

  const tour = booking?.Tour ?? null;
  const customer = booking?.User ?? null;

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
      year: "numeric"
    });
  };

  const formatMoney = (value?: number | null) => {
    if (value === null || value === undefined) return "—";
    return `£${value.toFixed(2)}`;
  };

  const formatBookingRef = (id?: string) => {
    if (!id) return "—";
    const clean = id.replace(/[^A-Za-z0-9]/g, "");
    const short = clean.slice(-6).toUpperCase();
    return `OT-${short}`;
  };

  const bookingRef = formatBookingRef(booking?.id);

  const currentGuide =
    booking?.guideId && guides.length
      ? guides.find((g: any) => g.id === booking.guideId) ?? null
      : null;
</script>

<div class="page-shell space-y-6">
  <!-- Header -->
  <header class="page-header">
    <div>
      <h1 class="page-title">Booking details</h1>
      <p class="page-subtitle">
        Admin view of booking, customer, tour and guide assignment.
      </p>
    </div>

    <a href="/admin/bookings" class="btn-secondary text-xs">
      ← Back to bookings
    </a>
  </header>

  <!-- Top summary -->
  <section class="grid gap-6 md:grid-cols-[2fr,1.4fr]">
    <!-- Left: booking + customer + tour -->
    <div class="space-y-4">
      <!-- Booking summary -->
      <div class="card space-y-3">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div class="text-meta">Booking reference</div>
            <div class="text-lg font-semibold">{bookingRef}</div>
            <div class="text-meta font-mono">{booking.id}</div>
          </div>

          <div class="space-y-1 text-right">
            <div class="text-meta">Status</div>
            {#if booking.status === "confirmed"}
              <span class="badge badge-active">Confirmed</span>
            {:else if booking.status === "cancel_requested"}
              <span class="badge badge-featured">Cancel requested</span>
            {:else if booking.status === "cancelled"}
              <span class="badge badge-inactive">Cancelled</span>
            {:else}
              <span class="badge badge-muted">
                {booking.status ?? "Pending"}
              </span>
            {/if}
          </div>
        </div>

        <div class="grid sm:grid-cols-3 gap-3 text-sm">
          <div>
            <div class="text-meta">Tour date</div>
            <div>{formatDate(booking.startDate ?? booking.createdAt)}</div>
          </div>
          <div>
            <div class="text-meta">Guests</div>
            <div>{booking.guests ?? "—"}</div>
          </div>
          <div>
            <div class="text-meta">Total / Paid</div>
            <div>
              {formatMoney(booking.totalAmount)} ·
              <span class="text-muted">
                Paid {formatMoney(booking.amountPaid)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer -->
      <div class="card space-y-3">
        <h2 class="text-sm font-semibold">Customer</h2>
        {#if customer}
          <div class="space-y-1 text-sm">
            {#if customer.name}
              <div class="font-semibold">{customer.name}</div>
            {/if}
            <div class="text-meta">{customer.email}</div>
            {#if customer.mobile}
              <div class="text-meta">Mobile: {customer.mobile}</div>
            {/if}
          </div>
        {:else}
          <p class="text-muted text-sm">
            No linked customer record — booking may have been created manually.
          </p>
        {/if}
      </div>

      <!-- Tour -->
      {#if tour}
        <div class="card space-y-3">
          <h2 class="text-sm font-semibold">Tour</h2>
          <div class="space-y-1 text-sm">
            <div class="font-semibold">{tour.title}</div>
            {#if tour.summary}
              <p class="text-muted">{tour.summary}</p>
            {/if}
            <div class="flex flex-wrap gap-3 text-meta">
              {#if tour.durationDays}
                <span>
                  {tour.durationDays} day{tour.durationDays === 1 ? "" : "s"}
                </span>
              {/if}
              {#if tour.pickupTime}
                <span>Pickup time: {tour.pickupTime}</span>
              {/if}
              {#if tour.price}
                <span>From £{tour.price}</span>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Right column: GUIDE ASSIGNMENT + admin controls -->
    <div class="space-y-4">
      <!-- ✅ GUIDE ASSIGNMENT CARD -->
      <section class="card space-y-4">
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-sm font-semibold">Guide assignment</h2>
          {#if guideUpdated}
            <span class="badge badge-active text-[10px]">
              Guide updated
            </span>
          {/if}
        </div>

        <!-- Current guide summary -->
        {#if currentGuide}
          <div class="flex items-center gap-3 text-sm">
            {#if currentGuide.photoUrl}
              <img
                src={currentGuide.photoUrl}
                alt="Guide photo"
                class="h-10 w-10 rounded-full object-cover border"
              />
            {/if}
            <div>
              <div class="font-semibold">
                {currentGuide.firstName} {currentGuide.lastName}
              </div>
              <div class="text-meta">{currentGuide.email}</div>
            </div>
          </div>
        {:else}
          <p class="text-sm text-muted">
            No guide assigned to this booking yet.
          </p>
        {/if}

        <!-- Assignment form -->
        <form method="POST" action="?/assignGuide" class="space-y-3">
          <div class="space-y-1">
            <label for="guideId" class="field-label">
              Assign / change guide
            </label>
            <select
              id="guideId"
              name="guideId"
              class="select"
            >
              <option value="">
                — No guide assigned —
              </option>
              {#each guides as guide}
                <option
                  value={guide.id}
                  selected={booking.guideId === guide.id}
                >
                  {guide.firstName} {guide.lastName} ({guide.email})
                </option>
              {/each}
            </select>
          </div>

          <div class="flex items-center justify-between gap-2">
            <button type="submit" class="btn-secondary btn-sm">
              Save guide
            </button>
            <p class="text-meta">
              Updates are saved instantly and logged in booking history.
            </p>
          </div>
        </form>
      </section>

      <!-- Admin notes -->
      <section class="card space-y-3">
        <h2 class="text-sm font-semibold">Admin notes</h2>
        <form method="POST" action="?/updateNotes" class="space-y-2">
          <textarea
            name="adminNotes"
            rows="5"
            class="textarea"
          >{booking.adminNotes ?? ""}</textarea>
          <button type="submit" class="btn-secondary btn-sm">
            Save notes
          </button>
        </form>
      </section>

      <!-- Cancellation controls (if relevant) -->
      {#if booking.status === "cancel_requested"}
        <section class="card-danger space-y-3">
          <h2 class="text-sm font-semibold">Cancellation requested</h2>
          <p class="text-sm">
            The customer has requested to cancel this booking. Choose whether to
            confirm the cancellation or keep the booking active.
          </p>
          <div class="flex flex-wrap gap-2">
            <form method="POST" action="?/approveCancellation">
              <button type="submit" class="btn-danger btn-sm">
                Confirm cancellation
              </button>
            </form>
            <form method="POST" action="?/keepBooking">
              <button type="submit" class="btn-secondary btn-sm">
                Keep booking
              </button>
            </form>
          </div>
        </section>
      {/if}
    </div>
  </section>
</div>