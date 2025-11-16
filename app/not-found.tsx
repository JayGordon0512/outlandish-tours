// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-semibold text-highland-ink">Page not found</h1>
        <p className="text-sm text-highland-ink/70">
          We couldn&apos;t find the page you were looking for. It may have
          moved, or the link might be incorrect.
        </p>
        <div className="flex justify-center gap-3 text-sm">
          <Link
            href="/"
            className="px-4 py-2 rounded-full bg-highland-gold text-highland-offwhite font-semibold hover:brightness-110 transition"
          >
            Back to home
          </Link>
          <Link
            href="/tours"
            className="px-4 py-2 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold transition"
          >
            View tours
          </Link>
        </div>
      </div>
    </main>
  );
}