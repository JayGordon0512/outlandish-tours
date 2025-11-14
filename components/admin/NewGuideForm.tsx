"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type GuideForm = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  photoUrl: string; // image holder
};

const emptyGuide: GuideForm = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  address: "",
  photoUrl: "",
};

export default function NewGuideForm() {
  const [form, setForm] = useState<GuideForm>(emptyGuide);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create guide");
      }

      router.push("/admin/guides");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-highland-offwhite border border-highland-stone rounded-2xl p-4 text-sm"
    >
      {/* Header / context */}
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-highland-ink">
          Add new guide
        </h1>
        <p className="text-xs text-highland-ink/70">
          Create a guide profile so you can assign tours and bookings to them.
        </p>
      </div>

      {/* Name + avatar row */}
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_auto] gap-3 items-end">
        <div className="space-y-1">
          <label>First name</label>
          <input
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
            value={form.firstName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, firstName: e.target.value }))
            }
          />
        </div>

        <div className="space-y-1">
          <label>Last name</label>
          <input
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
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
                alt={`${form.firstName || "Guide"} profile photo`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
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
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
          value={form.email}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, email: e.target.value }))
          }
        />
      </div>

      <div className="space-y-1">
        <label>Mobile</label>
        <input
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
          value={form.mobile}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, mobile: e.target.value }))
          }
        />
      </div>

      <div className="space-y-1">
        <label>Address</label>
        <textarea
          rows={3}
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
          value={form.address}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, address: e.target.value }))
          }
        />
      </div>

      {/* Image holder field */}
      <div className="space-y-1">
        <label>Profile photo URL (optional)</label>
        <input
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
          value={form.photoUrl}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, photoUrl: e.target.value }))
          }
          placeholder="https://example.com/guide-photo.jpg"
        />
        <p className="text-xs text-highland-ink/60">
          Paste a direct image URL here. This acts as the image holder for now.
          Later we can swap this to a proper file upload to storage and set this
          URL automatically.
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-highland-gold text-highland-offwhite px-5 py-2 text-xs font-semibold hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Create guide"}
      </button>
    </form>
  );
}