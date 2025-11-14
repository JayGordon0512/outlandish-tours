"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Guide } from "@prisma/client";

export function EditGuideForm({ guide }: { guide: Guide }) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: guide.firstName,
    lastName: guide.lastName,
    email: guide.email,
    mobile: guide.mobile ?? "",
    address: guide.address ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/guides/${guide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update");

      router.push("/admin/guides");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this guide?")) return;

    await fetch(`/api/admin/guides/${guide.id}`, {
      method: "DELETE",
    });

    router.push("/admin/guides");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-highland-offwhite border border-highland-stone rounded-2xl p-4 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          className="input"
          value={form.firstName}
          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
        />
        <input
          className="input"
          value={form.lastName}
          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
        />
      </div>

      <input
        type="email"
        className="input"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
      />

      <input
        className="input"
        value={form.mobile}
        onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
      />

      <textarea
        className="input"
        value={form.address}
        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
      />

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex items-center justify-between">
        <button className="btn-gold" disabled={loading}>
          {loading ? "Saving…" : "Save Changes"}
        </button>
        <button type="button" onClick={handleDelete} className="text-red-500 text-xs">
          Delete
        </button>
      </div>
    </form>
  );
}