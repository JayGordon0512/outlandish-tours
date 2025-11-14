// app/guide/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
// adjust import path if your auth options live elsewhere
import { authOptions } from "@/lib/auth";

export default async function GuideDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // @ts-expect-error – depending on your session typing
  const userId = session.user.id;
  // @ts-expect-error
  const role = session.user.role;

  if (role !== "GUIDE") {
    redirect("/");
  }

  const guide = await prisma.guide.findFirst({
    where: { userId },
    include: {
      tours: true, // make sure you added the back relation on Guide: tours Tour[]
    },
  });

  if (!guide) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-highland-ink">
          Guide dashboard
        </h1>
        <p className="mt-2 text-sm text-highland-ink/70">
          Your profile is not yet linked to any tours. Please contact
          Outlandish.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-xl md:text-2xl font-semibold text-highland-ink">
        Welcome, {guide.firstName}
      </h1>
      <p className="text-sm text-highland-ink/70">
        Here are the tours you are currently assigned to. This view is
        itinerary-only – no financials.
      </p>

      {guide.tours.length === 0 ? (
        <p className="text-sm text-highland-ink/70">
          You&apos;re not assigned to any tours yet.
        </p>
      ) : (
        <div className="space-y-2">
          {guide.tours.map((tour) => (
            <div
              key={tour.id}
              className="border border-highland-stone rounded-2xl bg-highland-offwhite px-4 py-3 text-sm"
            >
              <p className="font-semibold text-highland-ink">{tour.title}</p>
              {tour.summary && (
                <p className="text-xs text-highland-ink/70 mt-1">
                  {tour.summary}
                </p>
              )}
              <p className="text-xs text-highland-ink/60 mt-1">
                {tour.durationDays} day
                {tour.durationDays !== 1 && "s"} · Max{" "}
                {tour.maxGroupSize ?? "—"} guests
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}