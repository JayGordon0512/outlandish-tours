"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ExtraOption } from "@prisma/client";

const empty = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  durationDays: 1,
  pricePerPerson: 100,
  maxGroupSize: 8,
  heroImageUrl: "",
  options: [] as string[], // kept for backwards compatibility but unused now
  galleryImages: [] as string[]
};

type ImageSuggestion = {
  id: string;
  thumb: string;
  full: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewTourForm() {
  const [form, setForm] = useState(empty);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image suggestions for gallery/hero
  const [suggestions, setSuggestions] = useState<ImageSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  // Paid extras
  const [extraOptions, setExtraOptions] = useState<ExtraOption[]>([]);
  const [extrasLoading, setExtrasLoading] = useState(true);
  const [extrasError, setExtrasError] = useState<string | null>(null);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          extraOptionIds: selectedExtraIds
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create tour");
      }
      router.push("/admin/tours");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Paid extras: load options from API
  useEffect(() => {
    let cancelled = false;

    async function loadExtras() {
      setExtrasLoading(true);
      setExtrasError(null);
      try {
        const res = await fetch("/api/admin/options");
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data.error || "Failed to load options");
        }
        if (!cancelled) {
          setExtraOptions(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setExtrasError(err.message || "Failed to load options");
          setExtraOptions([]);
        }
      } finally {
        if (!cancelled) {
          setExtrasLoading(false);
        }
      }
    }

    loadExtras();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleExtra(extraId: string) {
    setSelectedExtraIds(prev =>
      prev.includes(extraId)
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  }

  function addGalleryImage(url: string) {
    if (!url) return;
    setForm(prev =>
      prev.galleryImages.includes(url)
        ? prev
        : { ...prev, galleryImages: [...prev.galleryImages, url] }
    );
  }

  function removeGalleryImage(url: string) {
    setForm(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter(u => u !== url)
    }));
  }

  async function fetchSuggestions() {
    setSuggestLoading(true);
    setSuggestError(null);
    setSuggestions([]);
    try {
      const query = form.title || "scottish highlands tour";
      const res = await fetch(
        `/api/admin/image-suggestions?query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch suggestions");
      }
      setSuggestions(data.results || []);
    } catch (err: any) {
      setSuggestError(err.message);
    } finally {
      setSuggestLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-highland-offwhite border border-highland-stone rounded-2xl p-4 text-sm"
    >
      {/* Title */}
      <div className="space-y-1">
        <label>Title</label>
        <input
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
          value={form.title}
          onChange={e => {
            const value = e.target.value;
            setForm(prev => ({
              ...prev,
              title: value,
              slug: slugTouched ? prev.slug : slugify(value)
            }));
          }}
        />
      </div>

      {/* Slug */}
      <div className="space-y-1">
        <label>Slug (URL)</label>
        <input
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
          value={form.slug}
          onChange={e => {
            if (!slugTouched) setSlugTouched(true);
            setForm(prev => ({
              ...prev,
              slug: e.target.value
            }));
          }}
        />
        <p className="text-xs text-highland-ink/60">
          This becomes the end of the tour link, e.g.{" "}
          <code className="px-1 bg-highland-stone/40 rounded">
            /tours/jamie-and-claires-highlands-adventure
          </code>
          . Use lowercase letters, numbers and hyphens only.
        </p>
      </div>

      {/* Summary */}
      <div className="space-y-1">
        <label>Summary</label>
        <textarea
          rows={2}
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
          value={form.summary}
          onChange={e =>
            setForm(prev => ({ ...prev, summary: e.target.value }))
          }
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label>Description (full itinerary)</label>
        <textarea
          rows={6}
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
          value={form.description}
          onChange={e =>
            setForm(prev => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      {/* Core numbers */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label>Duration (days)</label>
          <input
            type="number"
            min={1}
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
            value={form.durationDays}
            onChange={e =>
              setForm(prev => ({
                ...prev,
                durationDays: Number(e.target.value)
              }))
            }
          />
        </div>

        <div className="space-y-1">
          <label>Price per person (£)</label>
          <input
            type="number"
            min={1}
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
            value={form.pricePerPerson}
            onChange={e =>
              setForm(prev => ({
                ...prev,
                pricePerPerson: Number(e.target.value)
              }))
            }
          />
        </div>

        <div className="space-y-1">
          <label>Max group size</label>
          <input
            type="number"
            min={1}
            className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
            value={form.maxGroupSize}
            onChange={e =>
              setForm(prev => ({
                ...prev,
                maxGroupSize: Number(e.target.value)
              }))
            }
          />
        </div>
      </div>

      {/* Hero image */}
      <div className="space-y-1">
        <label>Hero image URL (optional)</label>
        <input
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
          value={form.heroImageUrl}
          onChange={e =>
            setForm(prev => ({ ...prev, heroImageUrl: e.target.value }))
          }
        />
        <p className="text-xs text-highland-ink/60">
          This will be used as the main banner image on the tour page and card.
        </p>
      </div>

      {/* Gallery & suggestions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label>Gallery images (optional)</label>
          <button
            type="button"
            onClick={fetchSuggestions}
            disabled={suggestLoading}
            className="text-xs px-3 py-1 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold hover:text-highland-gold"
          >
            {suggestLoading ? "Loading…" : "Get image suggestions"}
          </button>
        </div>

        {suggestError && (
          <p className="text-xs text-red-500">{suggestError}</p>
        )}

        {suggestions.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {suggestions.map(img => (
              <div key={img.id} className="space-y-1">
                <div
                  className="aspect-video rounded-lg bg-cover bg-center border border-highland-stone"
                  style={{ backgroundImage: `url(${img.thumb})` }}
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="flex-1 text-[10px] px-2 py-1 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold"
                    onClick={() =>
                      setForm(prev => ({
                        ...prev,
                        heroImageUrl: img.full
                      }))
                    }
                  >
                    Use as hero
                  </button>
                  <button
                    type="button"
                    className="flex-1 text-[10px] px-2 py-1 rounded-full border border-highland-stone text-highland-ink hover:border-highland-gold"
                    onClick={() => addGalleryImage(img.full)}
                  >
                    Add to gallery
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-1">
          <p className="text-xs text-highland-ink/60">
            You can also paste image URLs manually into the gallery below.
          </p>

          {/* Manual gallery URLs */}
          <div className="flex gap-2 mt-2">
            <input
              id="gallery-new"
              className="flex-1 rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink text-xs focus:outline-none focus:border-highland-gold"
              placeholder="Paste image URL and press Enter or click Add"
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  const url = input.value.trim();
                  if (url) {
                    addGalleryImage(url);
                    input.value = "";
                  }
                }
              }}
            />
            <button
              type="button"
              className="px-3 py-2 rounded-lg border border-highland-stone text-xs text-highland-ink hover:border-highland-gold"
              onClick={() => {
                const input = document.getElementById(
                  "gallery-new"
                ) as HTMLInputElement | null;
                if (!input) return;
                const url = input.value.trim();
                if (url) {
                  addGalleryImage(url);
                  input.value = "";
                }
              }}
            >
              Add
            </button>
          </div>

          {form.galleryImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.galleryImages.map(url => (
                <div
                  key={url}
                  className="flex items-center gap-2 border border-highland-stone rounded-full px-2 py-1 bg-highland-stone/30 text-[10px]"
                >
                  <span className="truncate max-w-[140px]">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(url)}
                    className="text-[10px] text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Paid extras */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-highland-ink text-sm">
            Paid extras for this tour
          </label>
          <a
            href="/admin/options"
            className="text-[11px] text-highland-ink/70 hover:text-highland-gold"
          >
            Manage options
          </a>
        </div>

        {extrasLoading ? (
          <p className="text-xs text-highland-ink/60">Loading extras…</p>
        ) : extrasError ? (
          <p className="text-xs text-red-500">{extrasError}</p>
        ) : extraOptions.length === 0 ? (
          <p className="text-xs text-highland-ink/60">
            No extra options defined yet. Create them in Admin → Options.
          </p>
        ) : (
          <div className="flex flex-col gap-2 text-xs">
            {extraOptions.map(opt => {
              const isSelected = selectedExtraIds.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  className="flex items-start gap-2 border border-highland-stone rounded-xl px-3 py-2 bg-highland-stone/20"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleExtra(opt.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-highland-ink">
                        {opt.name}
                      </span>
                      <span className="font-semibold text-highland-gold">
                        £{opt.price}
                      </span>
                    </div>
                    {opt.description && (
                      <p className="text-[11px] text-highland-ink/70 mt-0.5">
                        {opt.description}
                      </p>
                    )}
                    <p className="text-[11px] text-highland-ink/60 mt-0.5">
                      {opt.chargeType === "PER_PERSON"
                        ? "Charged per person"
                        : "Charged per tour"}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-highland-gold text-highland-offwhite px-5 py-2 text-xs font-semibold hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Create tour"}
      </button>
    </form>
  );
}