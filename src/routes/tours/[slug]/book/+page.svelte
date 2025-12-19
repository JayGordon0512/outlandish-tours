<!-- src/routes/tours/[slug]/book/+page.svelte -->
<script lang="ts">
  import type { PageData } from "./$types";
  import { env as publicEnv } from "$env/dynamic/public";

  export let data: PageData;
  export let form: any;

  const {
    tour,
    extraOptions = [],
    depositPercent,
    totalAmountPreview,
    depositPreview,
    cancelled,
    user
  } = (data as any);

  const recaptchaSiteKey = publicEnv.PUBLIC_RECAPTCHA_SITE_KEY;

  const initialValues = {
    name: user?.name ?? "",
    email: user?.email ?? "",
    startDate: "",
    guests: 2,
    notes: ""
  };

  // Wire SvelteKit form data
  $: values = form?.values ?? initialValues;
  $: fieldErrors = form?.fieldErrors ?? {};
  $: generalError = form?.error ?? null;

  const formatMoney = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "£0";
    return `£${value}`;
  };

  const heroImage =
    tour.heroImageUrl ||
    "/images/default-tour-placeholder.jpg";

  const isLoggedIn = !!user;
</script>

<svelte:head>
  <title>Book {tour.title} | Outlandish Tours</title>

  {#if recaptchaSiteKey}
    <!-- reCAPTCHA v2 -->
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
  {/if}
</svelte:head>

<div class="page-shell space-y-6">
  <!-- Page header -->
  <header class="page-header">
    <div>
      <h1 class="page-title">Book: {tour.title}</h1>
      <p class="page-subtitle">
        Secure your place with a deposit – balance payable closer to your tour date.
      </p>
    </div>
  </header>

  {#if cancelled}
    <div class="card-danger text-sm">
      <p>
        Your payment was cancelled. No booking has been made. You can adjust your details and try
        again.
      </p>
    </div>
  {/if}

  {#if generalError}
    <div class="card-danger text-sm">
      <p>{generalError}</p>
    </div>
  {/if}

  <!-- Two-column layout: form + summary -->
  <div class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
    <!-- Booking form -->
    <section class="card space-y-4">
      <h2 class="text-sm font-semibold">
        Your details
      </h2>

      {#if isLoggedIn}
        <p class="text-meta">
          You’re logged in as <strong>{user.email}</strong>. We’ll attach this booking to your
          account.
        </p>
      {/if}

      <form method="POST" class="space-y-5">
        <!-- Hidden tour fields -->
        <input type="hidden" name="tourId" value={tour.id} />
        <input type="hidden" name="tourTitle" value={tour.title} />

        <!-- Name -->
        <div class="space-y-1">
          <label for="name" class="field-label">Full name</label>
          <input
            id="name"
            name="name"
            class="input"
            type="text"
            value={values.name || (user?.name ?? "")}
            autocomplete="name"
            aria-invalid={fieldErrors.name ? "true" : "false"}
            readonly={isLoggedIn}
          />
          {#if fieldErrors.name}
            <p class="text-xs text-red-600 mt-1">{fieldErrors.name}</p>
          {/if}
        </div>

        <!-- Email -->
        <div class="space-y-1">
          <label for="email" class="field-label">Email address</label>
          <input
            id="email"
            name="email"
            class="input"
            type="email"
            value={values.email || (user?.email ?? "")}
            autocomplete="email"
            aria-invalid={fieldErrors.email ? "true" : "false"}
            readonly={isLoggedIn}
          />
          {#if fieldErrors.email}
            <p class="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
          {/if}
        </div>

        <!-- Password + confirm (only for non-logged-in users) -->
        {#if !isLoggedIn}
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-1">
              <label for="password" class="field-label">Create password</label>
              <input
                id="password"
                name="password"
                class="input"
                type="password"
                autocomplete="new-password"
                aria-invalid={fieldErrors.password ? "true" : "false"}
              />
              {#if fieldErrors.password}
                <p class="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
              {/if}
            </div>

            <div class="space-y-1">
              <label for="confirmPassword" class="field-label">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                class="input"
                type="password"
                autocomplete="new-password"
                aria-invalid={fieldErrors.confirmPassword ? "true" : "false"}
              />
              {#if fieldErrors.confirmPassword}
                <p class="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Date + guests (side by side) -->
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-1">
            <label for="startDate" class="field-label">Preferred date</label>
            <input
              id="startDate"
              name="startDate"
              class="input"
              type="date"
              value={values.startDate}
              aria-invalid={fieldErrors.startDate ? "true" : "false"}
            />
            {#if fieldErrors.startDate}
              <p class="text-xs text-red-600 mt-1">{fieldErrors.startDate}</p>
            {/if}
          </div>

          <div class="space-y-1">
            <label for="guests" class="field-label">Number of guests</label>
            <input
              id="guests"
              name="guests"
              class="input"
              type="number"
              min="1"
              value={values.guests}
              aria-invalid={fieldErrors.guests ? "true" : "false"}
            />
            {#if fieldErrors.guests}
              <p class="text-xs text-red-600 mt-1">{fieldErrors.guests}</p>
            {/if}
          </div>
        </div>

        <!-- Optional extras -->
        {#if extraOptions?.length}
          <div class="space-y-2">
            <label class="field-label">Optional extras</label>

            <div class="space-y-2">
              {#each extraOptions as opt (opt.id)}
                <label class="flex items-start gap-2 text-sm">
                  <input type="checkbox" name="extraOptionIds" value={opt.id} />
                  <span>
                    {opt.name}
                    <span class="text-meta">
                      — £{opt.price} ({opt.chargeType === "PER_PERSON" ? "per person" : "per tour"})
                    </span>

                    {#if opt.description}
                      <div class="text-meta">{opt.description}</div>
                    {/if}
                  </span>
                </label>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Notes -->
        <div class="space-y-1">
          <label for="notes" class="field-label">
            Anything we should know? (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            class="textarea"
            rows="3"
          >{values.notes}</textarea>
        </div>

        <!-- reCAPTCHA -->
        {#if recaptchaSiteKey}
          <div class="space-y-1">
            <label class="field-label">Security check</label>
            <div class="mt-2">
              <div class="g-recaptcha" data-sitekey={recaptchaSiteKey}></div>
            </div>
            {#if fieldErrors.captcha}
              <p class="text-xs text-red-600 mt-1">{fieldErrors.captcha}</p>
            {/if}
          </div>
        {/if}

        <!-- Submit -->
        <div class="pt-2 space-y-2">
          <button type="submit" class="btn-primary w-full">
            Pay deposit &amp; book tour
          </button>
          <p class="text-meta">
            You’ll be redirected to a secure Stripe checkout page to pay your deposit.
          </p>
        </div>
      </form>
    </section>

    <!-- Tour summary / pricing -->
    <aside class="space-y-4">
      <div class="card space-y-3">
        <div class="flex gap-3">
          <div class="h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg border">
            <img
              src={heroImage}
              alt={tour.title}
              class="h-full w-full object-cover"
            />
          </div>
          <div class="space-y-1 text-sm">
            <h2 class="font-semibold">{tour.title}</h2>
            {#if tour.summary}
              <p class="text-muted text-xs">
                {tour.summary}
              </p>
            {/if}
            <p class="text-meta">
              {tour.durationDays} day{tour.durationDays === 1 ? "" : "s"}
              {#if tour.maxGroupSize}
                · max {tour.maxGroupSize} guests
              {/if}
            </p>
          </div>
        </div>

        <div class="border-t pt-3 text-sm space-y-1" style="border-color: var(--border-subtle);">
          <div class="flex items-center justify-between">
            <span class="text-meta">
              Price per person
            </span>
            <span class="font-medium">
              {formatMoney(tour.pricePerPerson)}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-meta">
              Example total (for 2 guests)
            </span>
            <span>
              {formatMoney(totalAmountPreview)}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-meta">
              Deposit ({depositPercent}%)
            </span>
            <span class="font-semibold">
              {formatMoney(depositPreview)}
            </span>
          </div>
        </div>

        <p class="text-meta">
          Balance due closer to your tour date. We’ll confirm all details with you by email.
        </p>
      </div>
    </aside>
  </div>
</div>