import type { ReactNode } from "react";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

// Server action for logout
async function handleLogout() {
  "use server";
  await signOut({ redirectTo: "/" }); // or "/auth/login" if you prefer
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/auth/login");
  }

  const user = session.user as any;
  const displayName =
    user.name || user.email || "Admin";

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-highland-ink">Admin</h1>
          <p className="text-sm text-highland-ink/70">
            Manage tours, customers and bookings.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <nav className="flex flex-wrap gap-3 text-xs">
            <Link
              href="/admin"
              className="px-3 py-1 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold"
            >
              Overview
            </Link>
            <Link
              href="/admin/tours"
              className="px-3 py-1 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold"
            >
              Tours
            </Link>
            <Link
              href="/admin/bookings"
              className="px-3 py-1 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold"
            >
              Bookings
            </Link>
            <Link
              href="/admin/customers"
              className="px-3 py-1 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold"
            >
              Customers
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
        </div>
      </header>

      <div>{children}</div>
    </div>
  );
}