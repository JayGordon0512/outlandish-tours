// app/dashboard/layout.tsx
import type { ReactNode } from "react";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

// Server action for logout
async function handleLogout() {
  "use server";
  await signOut({ redirectTo: "/" }); // or "/auth/login"
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user as any;
  const displayName =
    user.name || (user.email ? user.email.split("@")[0] : "Guest");

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top bar only: nav + signed-in + logout */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4">
        <nav className="flex flex-wrap gap-3 text-xs">
          <Link
            href="/dashboard"
            className="px-3 py-1 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold"
          >
            My trips
          </Link>
          <Link
            href="/tours"
            className="px-3 py-1 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold"
          >
            Browse tours
          </Link>
          <Link
            href="/dashboard/profile"
            className="px-3 py-1 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold"
          >
            My details
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-highland-ink/70">
            Signed in as{" "}
            <span className="font-semibold text-highland-ink">
              {displayName}
            </span>
          </span>
          <form action={handleLogout}>
            <button
              type="submit"
              className="px-3 py-1 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      {/* Page content (includes its own heading) */}
      <main>{children}</main>
    </div>
  );
}