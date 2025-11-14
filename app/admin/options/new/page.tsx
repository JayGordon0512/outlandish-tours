// app/admin/options/new/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewOptionForm } from "@/components/admin/NewOptionForm";

export default async function AdminNewOptionPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-highland-ink">
          Create extra option
        </h1>
        <p className="text-sm text-highland-ink/70">
          Set up a paid add-on that can be attached to one or more tours.
        </p>
      </div>

      <NewOptionForm />
    </div>
  );
}