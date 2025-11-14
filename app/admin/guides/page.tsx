// app/admin/guides/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function GuidesPage() {
  let guides: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string | null;
    createdAt: Date;
  }[] = [];
  let error: string | null = null;

  try {
    guides = await prisma.guide.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        createdAt: true,
      },
    });
  } catch (e: any) {
    error = e?.message ?? "Failed to load guides.";
  }

  return (
    <div className="space-y-4">
      {/* Page heading */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-highland-ink">
            Guides
          </h2>
          <p className="text-sm text-highland-ink/70">
            Manage your tour guides and their contact details.
          </p>
        </div>

        <Link
          href="/admin/guides/new"
          className="text-xs px-4 py-2 rounded-full bg-highland-gold text-highland-offwhite font-semibold hover:brightness-110"
        >
          + Add guide
        </Link>
      </div>

      {/* Error display (if Prisma blows up) */}
      {error && (
        <p className="text-xs text-red-500">
          Error loading guides: {error}
        </p>
      )}

      {/* Guides table / empty state */}
      {guides.length === 0 && !error ? (
        <p className="text-sm text-highland-ink/70">
          No guides added yet. Click <strong>Add guide</strong> to create your first guide.
        </p>
      ) : null}

      {guides.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-highland-stone bg-highland-offwhite">
          <table className="min-w-full text-xs">
            <thead className="bg-highland-stone/40 text-highland-ink/80">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Name</th>
                <th className="px-3 py-2 text-left font-semibold">Email</th>
                <th className="px-3 py-2 text-left font-semibold">Mobile</th>
                <th className="px-3 py-2 text-left font-semibold">Created</th>
                <th className="px-3 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guides.map((guide) => (
                <tr
                  key={guide.id}
                  className="border-t border-highland-stone/60 hover:bg-highland-stone/20"
                >
                  <td className="px-3 py-2">
                    <span className="font-semibold text-highland-ink">
                      {guide.firstName} {guide.lastName}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-highland-ink/80">
                    {guide.email}
                  </td>
                  <td className="px-3 py-2 text-highland-ink/80">
                    {guide.mobile || "—"}
                  </td>
                  <td className="px-3 py-2 text-highland-ink/60">
                    {guide.createdAt.toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/admin/guides/${guide.id}`}
                      className="text-[11px] text-highland-gold font-semibold hover:underline"
                    >
                      View / edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}