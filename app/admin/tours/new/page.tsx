// app/admin/tours/new/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewTourForm } from "@/components/admin/NewTourForm";

export default async function AdminNewTourPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-highland-ink">
          Create new tour
        </h1>
        <p className="text-sm text-highland-ink/70">
          Set up a new Outlandish experience with pricing, options and imagery.
        </p>
      </div>

      <NewTourForm />
    </div>
  );
}