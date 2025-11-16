// app/not-found.tsx
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-highland-ink">
            Page not found
          </h1>
          <p className="mt-3 text-sm md:text-base text-highland-ink/70">
            The page you&apos;re looking for doesn&apos;t exist, has moved, or
            isn&apos;t part of this Outlandish adventure.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <Link
            href="/"
            className="px-4 py-2 rounded-full bg-highland-gold text-highland-offwhite font-medium hover:brightness-110 transition"
          >
            Back to homepage
          </Link>
          <Link
            href="/tours"
            className="px-4 py-2 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold transition"
          >
            View all tours
          </Link>
        </div>
      </div>
    </main>
  );
}