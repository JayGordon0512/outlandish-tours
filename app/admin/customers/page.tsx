import { prisma } from "@/lib/prisma";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-highland-ink">Customers</h2>
      <div className="space-y-2">
        {customers.map(c => (
          <div
            key={c.id}
            className="border border-highland-stone rounded-2xl p-3 bg-highland-offwhite flex items-center justify-between text-sm"
          >
            <div>
              <p className="font-semibold text-highland-ink">
                {c.name || "Unnamed"}
              </p>
              <p className="text-xs text-highland-ink/70">{c.email}</p>
            </div>
            <p className="text-xs text-highland-ink/60">
              Joined {c.createdAt.toISOString().slice(0, 10)}
            </p>
          </div>
        ))}
        {customers.length === 0 && (
          <p className="text-sm text-highland-ink/70">No customers yet.</p>
        )}
      </div>
    </div>
  );
}