"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AVAILABLE_OPTIONS = [
  { key: "private", label: "Private option available" },
  { key: "hotel", label: "Hotel / accommodation included" },
  { key: "entry-fees", label: "Entry fees included" },
  { key: "meals", label: "Meals included" },
  { key: "pickup", label: "Hotel / city pick-up available" }
];

const empty = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  durationDays: 1,
  pricePerPerson: 100,
  maxGroupSize: 8,
  heroImageUrl: "",
  options: [] as string[],
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
  const [suggestions, setSuggestions] = useState<ImageSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
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

  function toggleOption(key: string) {
    setForm(prev => {
      const exists = prev.options.includes(key);
      return {
        ...prev,
        options: exists
          ? prev.options.filter(k => k !== key)
          : [...prev.options, key]
      };
    });
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
      <div className="space-y-1">
        <label>Slug (URL)</label>
        <input
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
          value={form.slug}
          onChange={e => {
            if (!slugTouched) setSlugTouched(true);
            setForm(prev => ({ ...prev, slug: e.target.value }));
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
      <div className="space-y-1">
        <label>Summary</label>
        <textarea
          rows={2}
          className="w-full rounded-lg bg-highland-stone/30 border border-highland-stone px-3 py-2 text-highland-ink focus:outline-none focus:border-highland-gold"
          value={form.summary}
          onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
        />
      </div>
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

      <div className="space-y-2">
        <label>Options available for this tour</label>
        <div className="flex flex-wrap gap-3 text-xs">
          {AVAILABLE_OPTIONS.map(opt => (
            <label key={opt.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.options.includes(opt.key)}
                onChange={() => toggleOption(opt.key)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
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