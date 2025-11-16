// app/guide/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function GuideDashboardPage() {
  const session = await auth();

  // Only allow logged-in guides
  if (!session?.user || (session.user as any).role !== "GUIDE") {
    redirect("/auth/login");
  }

  const user = session.user as any;
  const displayName = user.name || user.email || "Guide";

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-highland-ink">
          Guide dashboard
        </h1>
        <p className="text-sm text-highland-ink/70">
          Welcome, <span className="font-semibold">{displayName}</span>. Here
          you&apos;ll see the tours and bookings assigned to you.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-highland-ink">
          Assigned tours
        </h2>
        <p className="text-sm text-highland-ink/70">
          This area will show a list of your upcoming tours and bookings, with
          pickup details, timings and guest info — but without any financial
          information.
        </p>
        <p className="text-sm text-highland-ink/60">
          For now, you can manage tours from the{" "}
          <Link
            href="/admin"
            className="text-highland-gold underline-offset-2 hover:underline"
          >
            admin area
          </Link>
          .
        </p>
      </section>
    </main>
  );
}