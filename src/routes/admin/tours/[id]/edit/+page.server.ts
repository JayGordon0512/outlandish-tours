import crypto from "node:crypto";
import type { PageServerLoad, Actions } from "./$types";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "$env/static/private";
import { fail, redirect } from "@sveltejs/kit";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

function getAdminFromCookie(cookies: any) {
  const raw = cookies.get("outlandish_session");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.isAdmin) return null;
    return parsed;
  } catch {
    return null;
  }
}

function publicUrl(path: string) {
  return supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
}

async function listFiles(prefix: string) {
  const { data, error } = await supabase.storage.from("images").list(prefix, {
    limit: 100,
    sortBy: { column: "name", order: "asc" }
  });

  if (error) {
    console.error("Storage list error:", error);
    return [];
  }

  return (data ?? [])
    .filter((x) => x.name && x.name !== ".emptyFolderPlaceholder")
    .map((x) => ({
      name: x.name,
      path: `${prefix}/${x.name}`,
      url: publicUrl(`${prefix}/${x.name}`)
    }));
}

/**
 * Detect join-table column names without guessing.
 * We try common variants and pick the first that works.
 */
async function detectJoinCols() {
  const candidates = [
    { tourCol: "tourId", optCol: "extraOptionId" },
    { tourCol: "tour_id", optCol: "extra_option_id" },
    { tourCol: "tourId", optCol: "extra_option_id" },
    { tourCol: "tour_id", optCol: "extraOptionId" }
  ];

  for (const c of candidates) {
    const { error } = await supabase.from("TourExtraOption").select(c.optCol).limit(1);
    if (!error) return c;
  }

  // fallback: assume camelCase
  return { tourCol: "tourId", optCol: "extraOptionId" };
}

async function loadSelectedOptionIds(tourId: string) {
  const { tourCol, optCol } = await detectJoinCols();

  const { data, error } = await supabase
    .from("TourExtraOption")
    .select(optCol)
    .eq(tourCol, tourId);

  if (error) {
    console.error("Error loading TourExtraOption:", error);
    return [];
  }

  return (data ?? []).map((r: any) => String(r?.[optCol])).filter(Boolean);
}

async function replaceTourExtraOptions(tourId: string, optionIds: string[]) {
  const { tourCol, optCol } = await detectJoinCols();

  // 1) delete existing
  const { error: delErr } = await supabase.from("TourExtraOption").delete().eq(tourCol, tourId);
  if (delErr) {
    console.error("Error deleting TourExtraOption rows:", delErr);
    throw delErr;
  }

  // 2) insert new (if any)
  if (optionIds.length === 0) return;

  const rows = optionIds.map((id) => ({
  id: crypto.randomUUID(),
  [tourCol]: tourId,
  [optCol]: id
}));
  const { error: insErr } = await supabase.from("TourExtraOption").insert(rows);
  if (insErr) {
    console.error("Error inserting TourExtraOption rows:", insErr);
    throw insErr;
  }
}

export const load: PageServerLoad = async ({ params, cookies }) => {
  const admin = getAdminFromCookie(cookies);
  if (!admin) throw redirect(303, "/auth/login");

  const id = params.id;
  if (!id) return { tour: null, error: "Missing tour id" };

  const { data: tour, error } = await supabase.from("Tour").select("*").eq("id", id).maybeSingle();

  if (error || !tour) {
    console.error("Error loading tour for edit:", error);
    return { tour: null, error: "Failed to load tour." };
  }

  // Load all available options
  const { data: allOptions, error: optErr } = await supabase
    .from("ExtraOption")
    .select("id,name,description,price,chargeType,isActive")
    .order("name", { ascending: true });

  if (optErr) console.error("Error loading ExtraOption:", optErr);

  const tourOptions = (allOptions ?? []).filter((o: any) => o.isActive !== false);

  // Load selected option ids from join table
  const selectedOptionIds = await loadSelectedOptionIds(id);

  const heroPrefix = `tours/${id}/hero`;
  const galleryPrefix = `tours/${id}/gallery`;

  const heroFiles = await listFiles(heroPrefix);
  const galleryFiles = await listFiles(galleryPrefix);

  return {
    admin,
    tour,
    tourOptions,
    selectedOptionIds,
    heroFiles,
    galleryFiles,
    error: null
  };
};

export const actions: Actions = {
  save: async ({ request, params, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) throw redirect(303, "/auth/login");

    const id = params.id;
    if (!id) return fail(400, { error: "Missing tour id" });

    const formData = await request.formData();

    const title = (formData.get("title") as string | null)?.trim() || "";
    const summary = (formData.get("summary") as string | null)?.trim() || "";
    const description = (formData.get("description") as string | null)?.trim() || "";

    const priceRaw = (formData.get("price") as string | null)?.trim() ?? "";
    const price = priceRaw === "" ? null : Number.parseInt(priceRaw, 10);

    const pricingModeRaw = (formData.get("pricingMode") as string | null) ?? "0";
    const pricingMode = pricingModeRaw === "1" ? 1 : 0;

    const durationDays = Number.parseInt((formData.get("durationDays") as string | null) ?? "", 10);
    const maxGroupSize = Number.parseInt((formData.get("maxGroupSize") as string | null) ?? "", 10);

    const pickupLocation = (formData.get("pickupLocation") as string | null)?.trim() || null;

    const isActive = formData.get("isActive") === "on";
    const isFeatured = formData.get("isFeatured") === "on";

    // ✅ Selected option IDs from checkboxes
    const selectedOptionIds = formData.getAll("optionIds").map(String).filter(Boolean);

    if (!title || !summary || !description || !Number.isFinite(durationDays) || !Number.isFinite(maxGroupSize)) {
      return fail(400, { error: "Title, summary, description, duration and max group size are required." });
    }

    // ✅ Keep Tour.options (text[]) in sync (optional but handy for legacy)
    let optionsText: string[] = [];
    if (selectedOptionIds.length > 0) {
      const { data: optRows, error: optErr } = await supabase
        .from("ExtraOption")
        .select("id,name")
        .in("id", selectedOptionIds);

      if (optErr) {
        console.error("Error resolving ExtraOption names:", optErr);
      } else {
        const map = new Map((optRows ?? []).map((r: any) => [String(r.id), r.name]));
        optionsText = selectedOptionIds.map((oid) => map.get(String(oid))).filter(Boolean) as string[];
      }
    }

    // 1) update Tour core fields
    const { error: updErr } = await supabase
      .from("Tour")
      .update({
        title,
        summary,
        description,
        durationDays,
        maxGroupSize,
        price,
        pricingMode,
        pickupLocation,
        options: optionsText,
        isActive,
        isFeatured,
        updatedAt: new Date().toISOString()
      })
      .eq("id", id);

    if (updErr) {
      console.error("Error updating tour:", updErr);
      return fail(500, { error: "Failed to update tour." });
    }

    // 2) update join table
    try {
      await replaceTourExtraOptions(id, selectedOptionIds);
    } catch (e) {
      console.error("Error updating TourExtraOption join rows:", e);
      return fail(500, { error: "Tour saved, but failed to update options." });
    }

    throw redirect(303, `/admin/tours/${id}/edit`);
  },

  uploadHero: async ({ request, params, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) throw redirect(303, "/auth/login");

    const id = params.id;
    if (!id) return fail(400, { error: "Missing tour id" });

    const formData = await request.formData();
    const file = formData.get("hero") as File | null;

    if (!file || file.size === 0) return fail(400, { error: "Please choose a hero image file." });

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `tours/${id}/hero/hero.${ext}`;

    const { error: upErr } = await supabase.storage.from("images").upload(path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg"
    });

    if (upErr) {
      console.error("Hero upload error:", upErr);
      return fail(500, { error: "Failed to upload hero image." });
    }

    const url = publicUrl(path);

    const { error: dbErr } = await supabase
      .from("Tour")
      .update({ heroImageUrl: url, updatedAt: new Date().toISOString() })
      .eq("id", id);

    if (dbErr) {
      console.error("DB update heroImageUrl error:", dbErr);
      return fail(500, { error: "Uploaded hero image but failed to update tour." });
    }

    throw redirect(303, `/admin/tours/${id}/edit`);
  },

  uploadGallery: async ({ request, params, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) throw redirect(303, "/auth/login");

    const id = params.id;
    if (!id) return fail(400, { error: "Missing tour id" });

    const formData = await request.formData();
    const files = formData.getAll("gallery") as File[];

    const realFiles = (files ?? []).filter((f) => f && f.size > 0);
    if (realFiles.length === 0) return fail(400, { error: "Please choose one or more gallery images." });

    const { data: current, error: fetchErr } = await supabase
      .from("Tour")
      .select("galleryImages")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr) {
      console.error("Fetch current galleryImages error:", fetchErr);
      return fail(500, { error: "Could not load current gallery images." });
    }

    const existing: string[] = Array.isArray(current?.galleryImages) ? current.galleryImages : [];
    const added: string[] = [];

    for (const f of realFiles) {
      const ext = f.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
      const path = `tours/${id}/gallery/${safeName}`;

      const { error: upErr } = await supabase.storage.from("images").upload(path, f, {
        upsert: false,
        contentType: f.type || "image/jpeg"
      });

      if (upErr) {
        console.error("Gallery upload error:", upErr);
        return fail(500, { error: "Failed to upload one of the gallery images." });
      }

      added.push(publicUrl(path));
    }

    const next = [...existing, ...added];

    const { error: dbErr } = await supabase
      .from("Tour")
      .update({ galleryImages: next, updatedAt: new Date().toISOString() })
      .eq("id", id);

    if (dbErr) {
      console.error("DB update galleryImages error:", dbErr);
      return fail(500, { error: "Uploaded gallery images but failed to update tour." });
    }

    throw redirect(303, `/admin/tours/${id}/edit`);
  },

  setHeroFromExisting: async ({ request, params, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) throw redirect(303, "/auth/login");

    const id = params.id;
    if (!id) return fail(400, { error: "Missing tour id" });

    const formData = await request.formData();
    const heroPath = (formData.get("heroPath") as string | null)?.trim() || "";

    if (!heroPath) return fail(400, { error: "No hero file selected." });

    const url = publicUrl(heroPath);

    const { error: dbErr } = await supabase
      .from("Tour")
      .update({ heroImageUrl: url, updatedAt: new Date().toISOString() })
      .eq("id", id);

    if (dbErr) {
      console.error("Set hero from existing error:", dbErr);
      return fail(500, { error: "Failed to set hero image." });
    }

    throw redirect(303, `/admin/tours/${id}/edit`);
  },

  deleteImage: async ({ request, params, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) throw redirect(303, "/auth/login");

    const id = params.id;
    if (!id) return fail(400, { error: "Missing tour id" });

    const formData = await request.formData();
    const path = (formData.get("path") as string | null)?.trim() || "";
    const url = (formData.get("url") as string | null)?.trim() || "";
    const kind = (formData.get("kind") as string | null)?.trim() || ""; // "hero" | "gallery"

    if (!path) return fail(400, { error: "Missing image path." });

    const { error: delErr } = await supabase.storage.from("images").remove([path]);
    if (delErr) {
      console.error("Delete storage error:", delErr);
      return fail(500, { error: "Failed to delete image from storage." });
    }

    if (kind === "hero") {
      await supabase.from("Tour").update({ heroImageUrl: null, updatedAt: new Date().toISOString() }).eq("id", id);
    }

    if (kind === "gallery" && url) {
      const { data: current } = await supabase.from("Tour").select("galleryImages").eq("id", id).maybeSingle();
      const existing: string[] = Array.isArray(current?.galleryImages) ? current.galleryImages : [];
      const next = existing.filter((x) => x !== url);
      await supabase.from("Tour").update({ galleryImages: next, updatedAt: new Date().toISOString() }).eq("id", id);
    }

    throw redirect(303, `/admin/tours/${id}/edit`);
  }
};