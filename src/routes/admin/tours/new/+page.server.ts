// src/routes/admin/tours/new/+page.server.ts
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

export const load: PageServerLoad = async ({ cookies }) => {
  const admin = getAdminFromCookie(cookies);
  if (!admin) throw redirect(303, "/auth/login");

  const { data: tourOptions, error: optionsError } = await supabase
    .from("ExtraOption")
    .select("id, name, description, price, chargeType, isActive")
    .order("name", { ascending: true });

  if (optionsError) {
    console.error("Error loading ExtraOption:", optionsError);
  }

  return {
    admin,
    tourOptions: (tourOptions ?? []).filter((o: any) => o.isActive !== false)
  };
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) throw redirect(303, "/auth/login");

    const formData = await request.formData();

    const title = (formData.get("title") as string | null)?.trim() || "";
    const slug = (formData.get("slug") as string | null)?.trim() || "";
    const summary = (formData.get("summary") as string | null)?.trim() || "";
    const description = (formData.get("description") as string | null)?.trim() || "";

    const durationDays = Number.parseInt((formData.get("durationDays") as string | null) ?? "", 10);
    const maxGroupSize = Number.parseInt((formData.get("maxGroupSize") as string | null) ?? "", 10);

    const priceRaw = (formData.get("price") as string | null)?.trim() ?? "";
    const price = priceRaw === "" ? null : Number.parseInt(priceRaw, 10);

    const pricingModeRaw = (formData.get("pricingMode") as string | null) ?? "0";
    const pricingMode = pricingModeRaw === "1" ? 1 : 0;

    const pickupLocation = (formData.get("pickupLocation") as string | null)?.trim() || null;
    const pickupTime = (formData.get("pickupTime") as string | null)?.trim() || null;

    const isActive = formData.get("isActive") === "on";
    const isFeatured = formData.get("isFeatured") === "on";

    // ✅ Selected ExtraOption IDs from checkboxes
    const selectedOptionIds = formData.getAll("optionIds").map(String).filter(Boolean);

    // Keep existing Tour.options text[] for compatibility (names)
    let options: string[] = [];
    if (selectedOptionIds.length > 0) {
      const { data: optRows, error: optErr } = await supabase
        .from("ExtraOption")
        .select("id, name")
        .in("id", selectedOptionIds);

      if (optErr) {
        console.error("Error resolving selected ExtraOption ids:", optErr);
      } else {
        const map = new Map((optRows ?? []).map((r: any) => [r.id, r.name]));
        options = selectedOptionIds.map((id) => map.get(id)).filter(Boolean) as string[];
      }
    }

    if (
      !title ||
      !slug ||
      !summary ||
      !description ||
      !Number.isFinite(durationDays) ||
      !Number.isFinite(maxGroupSize)
    ) {
      return fail(400, {
        error: "Title, slug, summary, description, duration and max group size are required.",
        values: {
          title,
          slug,
          summary,
          description,
          durationDays: Number.isFinite(durationDays) ? durationDays : "",
          maxGroupSize: Number.isFinite(maxGroupSize) ? maxGroupSize : "",
          price: priceRaw,
          pricingMode,
          pickupLocation: pickupLocation ?? "",
          pickupTime: pickupTime ?? "",
          selectedOptionIds,
          isActive,
          isFeatured
        }
      });
    }

    const nowIso = new Date().toISOString();

    const { data: created, error } = await supabase
      .from("Tour")
      .insert({
        title,
        slug,
        summary,
        description,
        durationDays,
        maxGroupSize,
        price,
        pricingMode,
        pickupLocation,
        pickupTime,
        heroImageUrl: null,
        galleryImages: [],
        options, // legacy compatibility
        isActive,
        isFeatured,
        updatedAt: nowIso
      })
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Error creating tour:", error);
      return fail(500, { error: "Failed to create tour." });
    }

    if (!created?.id) {
      return fail(500, { error: "Tour created but no id returned." });
    }

    // ✅ NEW: write join table rows
    if (selectedOptionIds.length > 0) {
      const rows = selectedOptionIds.map((extraOptionId) => ({
        tourId: created.id,
        extraOptionId
      }));

      const { error: joinErr } = await supabase.from("TourExtraOption").insert(rows);
      if (joinErr) {
        console.error("Error inserting TourExtraOption rows:", joinErr);
        // Not fatal; tour exists. You can decide if you want this to fail hard later.
      }
    }

    throw redirect(303, `/admin/tours/${created.id}/edit`);
  }
};