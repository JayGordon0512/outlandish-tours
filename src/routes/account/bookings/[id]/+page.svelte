<script lang="ts">
  export let data: any;
  export let form: any;

  const booking = data.booking;
  const tour = data.tour;
  const shortRef: string = data.shortRef;
  const balanceRemaining: number = data.balanceRemaining;
  const minPayment: number = data.minPayment;

  const statusLabel = (status: string | null | undefined) => {
    if (!status) return "Pending";
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "cancel_requested":
        return "Cancellation requested";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const statusClass = (status: string | null | undefined) => {
    if (!status) return "badge-muted";
    switch (status) {
      case "confirmed":
        return "badge-active";
      case "cancel_requested":
        return "badge-featured";
      case "cancelled":
        return "badge-inactive";
      default:
        return "badge-muted";
    }
  };

  const formatDate = (value?: string | null) => {
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

<div class="page-shell space-y-6">
  <!-- Header -->
  <header class="page-header">
    <div>
      <h1 class="page-title">Manage your booking</h1>
      <p class="page-subtitle">
        Booking reference <span class="mono">{shortRef}</span>
      </p>
    </div>
  </header>

  <!-- Success / error banners -->
  {#if form?.pickupSaved}
    <div class="card">
      <p class="text-sm">
        ✅ Pickup location saved for this booking.
      </p>
    </div>
  {/if}

  {#if form?.payError}
    <div class="card-danger">
      <p class="text-sm">
        {form.payError}
      </p>
    </div>
  {/if}

  {#if !booking}
    <div class="card">
      <p class="text-sm">Booking not found.</p>
    </div>
  {:else}
    <!-- Top summary -->
    <section class="card space-y-3">
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-sm font-semibold">
            {tour?.title ?? "Your Outlandish tour"}
          </h2>
          <p class="text-meta">
            Tour date: <strong>{formatDate(booking.startDate)}</strong> · Guests:
            <strong>{booking.guests}</strong>
          </p>
          {#if tour?.summary}
            <p class="text-sm text-muted">
              {tour.summary}
            </p>
          {/if}
        </div>

        <div class="flex flex-col items-start md:items-end gap-2">
          <span class={"badge " + statusClass(booking.status)}>
            {statusLabel(booking.status)}
          </span>
          <p class="text-meta">
            Total: <strong>£{booking.totalAmount ?? 0}</strong><br />
            Paid so far: <strong>£{booking.amountPaid ?? 0}</strong><br />
            Balance remaining:
            <strong>£{Math.max(0, (booking.totalAmount ?? 0) - (booking.amountPaid ?? 0))}</strong>
          </p>
        </div>
      </div>
    </section>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Left column: Pickup + notes -->
      <section class="space-y-6">
        <!-- Pickup form -->
        <div class="card space-y-3">
          <h2 class="text-sm font-semibold">
            Pickup location
          </h2>
          <p class="text-sm text-muted">
            Tell us where to collect your group (e.g. hotel name, address, meeting point).
          </p>

          <form method="POST" action="?/updatePickup" class="space-y-3">
            <div class="space-y-1">
              <label for="pickupLocation" class="field-label">
                Pickup instructions
              </label>
              <textarea
                id="pickupLocation"
                name="pickupLocation"
                rows="3"
                class="textarea"
              >{form?.pickupLocation ?? booking.pickupLocation ?? ""}</textarea>
              {#if form?.fieldErrors?.pickupLocation}
                <p class="text-meta" style="color: var(--danger);">
                  {form.fieldErrors.pickupLocation}
                </p>
              {/if}
            </div>

            <button type="submit" class="btn-primary btn-sm">
              Save pickup location
            </button>
          </form>
        </div>

        <!-- Admin notes (readonly) -->
        {#if booking.adminNotes}
          <div class="card space-y-2">
            <h2 class="text-sm font-semibold">
              Notes from Outlandish
            </h2>
            <p class="text-sm">
              {booking.adminNotes}
            </p>
          </div>
        {/if}
      </section>

      <!-- Right column: Payments & actions -->
      <section class="space-y-6">
        <!-- Payments & balance -->
        <div class="card space-y-3">
          <h2 class="text-sm font-semibold">
            Payments & balance
          </h2>

          <div class="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div class="text-meta">Total</div>
              <div class="font-semibold">£{booking.totalAmount ?? 0}</div>
            </div>
            <div>
              <div class="text-meta">Paid</div>
              <div class="font-semibold">£{booking.amountPaid ?? 0}</div>
            </div>
            <div>
              <div class="text-meta">Remaining</div>
              <div class="font-semibold">
                £{Math.max(0, (booking.totalAmount ?? 0) - (booking.amountPaid ?? 0))}
              </div>
            </div>
          </div>

          {#if balanceRemaining > 0}
            <form method="POST" action="?/payBalance" class="space-y-2 max-w-xs">
              <div class="space-y-1">
                <label for="amount" class="field-label">
                  Amount to pay now
                </label>
                <div class="flex items-center gap-2">
                  <span class="text-sm">£</span>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min={minPayment}
                    max={balanceRemaining}
                    step="1"
                    class="input"
                    value={form?.amount ?? minPayment}
                  />
                </div>
                <p class="text-meta">
                  Minimum payment £{minPayment}. Remaining balance £{balanceRemaining}.
                </p>
              </div>

              <button type="submit" class="btn-primary btn-sm">
                Pay towards balance
              </button>
            </form>
          {:else}
            <p class="text-sm text-muted">
              This booking is fully paid. Thank you!
            </p>
          {/if}
        </div>

        <!-- Cancellation info (UI only – your existing admin/customer flows still apply) -->
        <div class="card space-y-2">
          <h2 class="text-sm font-semibold">
            Need to change or cancel?
          </h2>
          <p class="text-sm text-muted">
            If you need to change your date or cancel, please contact us and quote
            your reference <span class="mono">{shortRef}</span>. Any existing
            cancellation requests will appear in your booking status above.
          </p>
        </div>
      </section>
    </div>
  {/if}
</div>