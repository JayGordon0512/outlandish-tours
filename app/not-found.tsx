// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-semibold text-highland-ink">
          Page not found
        </h1>
        <p className="text-sm md:text-base text-highland-ink/70">
          Sorry, we couldn&apos;t find the page you were looking for.
          It may have been moved, deleted, or the URL might be incorrect.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          <Link
            href="/"
            className="px-5 py-2 rounded-full bg-highland-gold text-highland-offwhite text-sm font-semibold hover:brightness-110 transition"
          >
            Back to homepage
          </Link>
          <Link
            href="/tours"
            className="px-5 py-2 rounded-full border border-highland-stone text-highland-ink text-sm hover:border-highland-gold hover:text-highland-gold transition"
          >
            Browse tours
          </Link>
        </div>
      </div>
    </main>
  );
}