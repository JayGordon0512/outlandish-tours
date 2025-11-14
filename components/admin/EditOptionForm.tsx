// components/admin/EditOptionForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ExtraOption } from "@prisma/client";

type ChargeType = "PER_PERSON" | "PER_TOUR";

export function EditOptionForm({ option }: { option: ExtraOption }) {
  const router = useRouter();
  const [name, setName] = useState(option.name);
  const [description, setDescription] = useState(option.description ?? "");
  const [price, setPrice] = useState<number | "">(option.price);
  const [chargeType, setChargeType] = useState<ChargeType>(
    option.chargeType as ChargeType
  );
  const [isActive, setIsActive] = useState(option.isActive);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/options/${option.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: price === "" ? 0 : Number(price),
          chargeType,
          isActive
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to update option");
      }

      router.push("/admin/options");
    } catch (err: any) {
      setError(err.message || "Failed to update option");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this option? This cannot be undone.")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/options/${option.id}`, {
        method: "DELETE"
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete option");
      }
      router.push("/admin/options");
    } catch (err: any) {
      setError(err.message || "Failed to delete option");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-highland-offwhite border border-highland-stone rounded-2xl p-4 text-sm"
    >
      <div className="space-y-1">
        <label className="block text-highland-ink text-xs font-semibold">
          Name
        </label>
        <input
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-highland-ink text-xs font-semibold">
          Description
        </label>
        <textarea
          rows={3}
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-highland-ink text-xs font-semibold">
            Price (£)
          </label>
          <input
            type="number"
            min={0}
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
            value={price}
            onChange={e =>
              setPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>
        <div className="space-y-1">
          <label className="block text-highland-ink text-xs font-semibold">
            Charge type
          </label>
          <select
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
            value={chargeType}
            onChange={e => setChargeType(e.target.value as ChargeType)}
          >
            <option value="PER_PERSON">Per person</option>
            <option value="PER_TOUR">Per tour</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <input
          id="isActive"
          type="checkbox"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
        />
        <label htmlFor="isActive" className="text-highland-ink">
          Option is active (available to add to tours & bookings)
        </label>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-highland-gold text-highland-offwhite px-5 py-2 text-xs font-semibold hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-red-500 hover:text-red-600"
        >
          Delete option
        </button>
      </div>
    </form>
  );
}