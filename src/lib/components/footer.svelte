<!-- src/lib/components/Footer.svelte -->
<footer class="border-t mt-10" style="border-color: var(--border-subtle);">
  <div class="page-shell py-8 space-y-4">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="text-sm text-muted">
        © {new Date().getFullYear()} Outlandish Tours. All rights reserved.
      </div>

      <nav class="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <a href="/about" class="text-muted hover:underline">About</a>
        <a href="/contact" class="text-muted hover:underline">Contact</a>
        <a href="/privacy" class="text-muted hover:underline">Privacy</a>
        <a href="/cookies" class="text-muted hover:underline">Cookies</a>
        <a href="/terms" class="text-muted hover:underline">Terms</a>
      </nav>
    </div>

    <p class="text-xs text-meta">
      Payments are processed securely via Stripe where applicable. Travel details and availability are confirmed by email.
    </p>
  </div>
</footer>