<!-- src/routes/about/+page.svelte -->
<svelte:head>
  <title>About Us | Outlandish Experience</title>
  <meta
    name="description"
    content="Outlandish Experience creates immersive, small-group journeys through Scotland — inspired by Outlander, grounded in real history, and delivered with local expertise."
  />
</svelte:head>

<div class="page-shell space-y-8">
  <header class="page-header">
    <div>
      <h1 class="page-title">About Outlandish Experience</h1>
      <p class="page-subtitle">
        Immersive, small-group journeys through Scotland — inspired by <em>Outlander</em>, grounded in real history,
        and delivered with serious local knowledge.
      </p>
    </div>
  </header>

  <section class="card space-y-3">
    <h2 class="text-sm font-semibold">Who we are</h2>
    <p class="text-sm leading-relaxed text-muted">
      Outlandish Experience is a Scotland-based tour company built for travellers who want more than a checklist.
      We blend iconic locations with storytelling, time-period context, and modern comfort — so your day feels
      like stepping into the world of <em>Outlander</em>, while still being a genuinely great Scottish adventure.
    </p>
    <p class="text-sm leading-relaxed text-muted">
      Whether you’re chasing filming locations, clan history, Jacobite stories, castles, whisky, landscapes, or folklore —
      we tailor the experience around your group.
    </p>
  </section>

  <section class="card space-y-3">
    <h2 class="text-sm font-semibold">What makes us different</h2>
    <ul class="text-sm text-muted space-y-2">
      <li><span class="font-medium" style="color: var(--ink);">Outlander-inspired, not “theme park”</span> — the story is the thread, but the experience is real Scotland.</li>
      <li><span class="font-medium" style="color: var(--ink);">Small groups, better days</span> — more flexibility, better stops, better photos, less rushing.</li>
      <li><span class="font-medium" style="color: var(--ink);">Local expertise</span> — guides who know the history, geography, and the hidden details.</li>
      <li><span class="font-medium" style="color: var(--ink);">Thoughtful itineraries</span> — time to explore, not just hop off a bus.</li>
      <li><span class="font-medium" style="color: var(--ink);">Personal touches</span> — recommendations, pacing, and optional extras to match your group.</li>
    </ul>
  </section>

  <section class="card space-y-3">
    <h2 class="text-sm font-semibold">Our approach</h2>
    <div class="grid gap-4 md:grid-cols-3">
      <div class="space-y-1">
        <div class="text-sm font-semibold">Story</div>
        <p class="text-sm text-muted">
          The people, places, and moments that shaped Scotland — told clearly, with context that makes it stick.
        </p>
      </div>

      <div class="space-y-1">
        <div class="text-sm font-semibold">Place</div>
        <p class="text-sm text-muted">
          Landscapes and locations that feel cinematic in real life — with time built in to actually enjoy them.
        </p>
      </div>

      <div class="space-y-1">
        <div class="text-sm font-semibold">Care</div>
        <p class="text-sm text-muted">
          A smooth, well-run day where you feel looked after — from pickup to the final stop.
        </p>
      </div>
    </div>
  </section>

  <section class="card space-y-3">
    <h2 class="text-sm font-semibold">What to expect</h2>
    <ul class="text-sm text-muted space-y-2">
      <li>Clear pickup points and timings</li>
      <li>Comfortable transport</li>
      <li>Friendly, professional guides</li>
      <li>Support before and after your tour</li>
      <li>Secure online booking with deposit payments</li>
    </ul>
  </section>

  <section class="card space-y-3">
    <h2 class="text-sm font-semibold">Ready to step into Scotland’s story?</h2>
    <p class="text-sm text-muted">
      Browse our tours and lock in your date with a secure deposit — or contact us with what you’re looking for.
    </p>
    <div class="flex flex-col sm:flex-row gap-2">
      <a href="/tours" class="btn-primary text-center">View tours</a>
      <a href="/contact" class="btn-secondary text-center">Contact us</a>
    </div>
  </section>
</div>
