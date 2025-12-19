<script lang="ts">
  export let data: {
    sessionId: string | null;
    booking: any;
    error: string | null;
  };

  const { sessionId, booking, error } = data;

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

<div class="page-shell space-y-6">
  <header class="page-header">
    <div>
      <h1 class="page-title">Booking complete</h1>
      <p class="page-subtitle">
        Thank you – your deposit has been received and your Outlandish adventure is now in our system.
      </p>
    </div>
  </header>

  {#if error}
    <div class="card-danger space-y-2">
      <p class="text-sm">
        {error}
      </p>
      {#if sessionId}
        <p class="text-meta">
          Stripe session: <span class="mono">{sessionId}</span>
        </p>
      {/if}
      <p class="text-meta">
        If you're unsure whether your booking went through, please email
        <a href="mailto:info@outlandishexp.com">info@outlandishexp.com</a>.
      </p>
    </div>
  {:else}
    <div class="card space-y-4">
      <p class="text-sm">
        We’ve emailed you a receipt for your payment. Our team will confirm final details and send your full
        booking confirmation shortly.
      </p>

      {#if booking}
        <div class="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <h2 class="text-sm font-semibold mb-1">Tour details</h2>
            <p><span class="text-meta">Tour:</span> {booking.tourTitle ?? "Your selected tour"}</p>
            <p><span class="text-meta">Date:</span> {formatDate(booking.startDate)}</p>
            <p><span class="text-meta">Guests:</span> {booking.guests ?? "—"}</p>
          </div>

          <div>
            <h2 class="text-sm font-semibold mb-1">Payment</h2>
            <p>
              <span class="text-meta">Deposit paid:</span>
              {#if booking.depositAmount}
                £{booking.depositAmount} ({booking.depositPercent ?? "—"}% of tour price)
              {:else}
                Not available
              {/if}
            </p>
            {#if booking.totalAmount}
              <p>
                <span class="text-meta">Total tour cost:</span> £{booking.totalAmount}
              </p>
            {/if}
          </div>
        </div>

        <div class="border-t pt-3 mt-3 text-sm text-muted">
          <p>
            Booking reference:
            <span class="mono">
              {booking.bookingId ?? "will be confirmed in your email"}
            </span>
          </p>
        </div>
      {:else}
        <p class="text-sm text-muted">
          We couldn't load the booking details from Stripe, but your payment has been processed.
          If you don’t receive a confirmation email within a few minutes, please contact us.
        </p>
      {/if}
    </div>
  {/if}

  <div class="flex gap-2">
    <a href="/tours" class="btn-secondary text-sm">
      View more tours
    </a>
    <a href="/" class="btn-ghost text-sm">
      Back to homepage
    </a>
  </div>
</div>