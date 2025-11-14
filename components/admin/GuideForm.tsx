"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface GuideFormProps {
  guide?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string | null;
    address?: string | null;
    photoUrl?: string | null;
  };
}

export function GuideForm({ guide }: GuideFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: guide?.firstName || "",
    lastName: guide?.lastName || "",
    email: guide?.email || "",
    mobile: guide?.mobile || "",
    address: guide?.address || "",
    photoUrl: guide?.photoUrl || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!guide;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/guides/${guide!.id}`
        : `/api/admin/guides`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save guide");
      }

      router.push("/admin/guides");
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-highland-offwhite border border-highland-stone rounded-2xl p-4 text-sm"
    >
      {/* Name + avatar preview */}
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_auto] gap-3 items-end">
        <div className="space-y-1">
          <label>First name</label>
          <input
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink"
            value={form.firstName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, firstName: e.target.value }))
            }
          />
        </div>

        <div className="space-y-1">
          <label>Last name</label>
          <input
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink"
            value={form.lastName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, lastName: e.target.value }))
            }
          />
        </div>

        {/* Avatar preview */}
        <div className="flex justify-center md:justify-end">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-highland-stone bg-highland-stone/40 flex items-center justify-center text-[10px] text-highland-ink/70">
            {form.photoUrl ? (
              <Image
                src={form.photoUrl}
                alt="Guide photo"
                width={64}
                height={64}
                className="object-cover"
              />
            ) : (
              <span>No photo</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label>Email</label>
        <input
          type="email"
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink"
          value={form.email}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, email: e.target.value }))
          }
        />
      </div>

      <div className="space-y-1">
        <label>Mobile</label>
        <input
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink"
          value={form.mobile || ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, mobile: e.target.value }))
          }
        />
      </div>

      <div className="space-y-1">
        <label>Address</label>
        <textarea
          rows={3}
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink"
          value={form.address || ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, address: e.target.value }))
          }
        />
      </div>

      {/* NEW Photo URL */}
      <div className="space-y-1">
        <label>Profile photo URL (optional)</label>
        <input
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink"
          value={form.photoUrl}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, photoUrl: e.target.value }))
          }
          placeholder="https://example.com/guide.jpg"
        />
        <p className="text-xs text-highland-ink/60">
          Add a direct image URL. Later we can replace this with drag-and-drop
          uploads to Supabase Storage.
        </p>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        className="rounded-full bg-highland-gold text-highland-offwhite px-5 py-2 text-xs font-semibold hover:brightness-110"
        disabled={loading}
      >
        {loading ? "Saving…" : isEditing ? "Save changes" : "Create guide"}
      </button>
    </form>
  );
}