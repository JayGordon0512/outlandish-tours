// app/dashboard/profile/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function updateProfile(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user as any;
  const userId = user.id as string;

  const name = (formData.get("name") as string | null)?.trim() ?? "";

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || null,
    },
  });

  redirect("/dashboard/profile?updated=1");
}

interface PageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user as any;
  const userId = user.id as string;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!dbUser) {
    redirect("/auth/login");
  }

  const updatedParam = searchParams?.updated;
  const updated =
    (Array.isArray(updatedParam) ? updatedParam[0] : updatedParam) === "1";

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-highland-ink">
          My details
        </h1>
        <p className="text-sm text-highland-ink/70">
          Update your name and view your account information.
        </p>
      </header>

      {updated && (
        <div className="border border-green-600/40 bg-green-600/10 text-green-800 text-xs rounded-2xl px-4 py-3">
          <p className="font-semibold mb-0.5">Profile updated</p>
          <p>Your changes have been saved.</p>
        </div>
      )}

      <div className="border border-highland-stone rounded-2xl bg-highland-offwhite p-4 text-sm space-y-4">
        <form action={updateProfile} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-xs font-medium text-highland-ink"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={dbUser.name ?? ""}
              className="w-full rounded-xl border border-highland-stone bg-highland-stone/10 px-3 py-2 text-sm text-highland-ink focus:outline-none focus:ring-1 focus:ring-highland-gold"
              placeholder="Your name"
            />
            <p className="text-[11px] text-highland-ink/60">
              This will appear in your booking communications and dashboard
              header.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-highland-ink">
              Email
            </label>
            <p className="px-3 py-2 rounded-xl bg-highland-stone/10 border border-highland-stone text-highland-ink/80 text-xs">
              {dbUser.email}
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-highland-gold text-highland-offwhite px-5 py-2 text-xs font-semibold hover:brightness-110"
          >
            Save changes
          </button>
        </form>

        <div className="border-t border-highland-stone/60 pt-3 mt-2 text-[11px] text-highland-ink/60">
          <p>
            Account created on{" "}
            {dbUser.createdAt
              ? new Date(dbUser.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "—"}
            .
          </p>
        </div>
      </div>
    </div>
  );
}