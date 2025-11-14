// app/admin/options/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminOptionsPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/auth/login");
  }

  const options = await prisma.extraOption.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-highland-ink">
            Tour extras &amp; options
          </h1>
          <p className="text-sm text-highland-ink/70">
            Define paid add-ons like accommodation, airport pickups or private upgrades.
          </p>
        </div>
        <Link
          href="/admin/options/new"
          className="text-xs px-3 py-1 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold"
        >
          + New option
        </Link>
      </div>

      <div className="space-y-2">
        {options.map(opt => (
          <div
            key={opt.id}
            className="border border-highland-stone rounded-2xl p-3 bg-highland-offwhite flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm"
          >
            <div>
              <p className="text-xs text-highland-ink/70">
                {opt.isActive ? "Active" : "Inactive"} ·{" "}
                {opt.chargeType === "PER_PERSON" ? "Per person" : "Per tour"}
              </p>
              <p className="font-semibold text-highland-ink">{opt.name}</p>
              {opt.description && (
                <p className="text-xs text-highland-ink/70 mt-0.5">
                  {opt.description}
                </p>
              )}
            </div>
            <div className="text-right text-sm space-y-1">
              <p className="font-semibold text-highland-gold">
                £{opt.price}
              </p>
              <Link
                href={`/admin/options/${opt.id}`}
                className="text-[11px] text-highland-ink/70 hover:text-highland-gold"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}

        {options.length === 0 && (
          <p className="text-sm text-highland-ink/70">
            No extras defined yet. Click &quot;New option&quot; to add your first one.
          </p>
        )}
      </div>
    </div>
  );
}