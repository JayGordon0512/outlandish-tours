// src/routes/admin/tours/[id]/+page.server.ts
import type { PageServerLoad, Actions } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { supabase } from "$lib/server/supabaseClient";

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;

  const { data: tour, error: dbError } = await supabase
    .from("Tour")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (dbError) {
    console.error("Error loading tour:", dbError);
    throw error(500, "Failed to load tour");
  }

  if (!tour) {
    throw error(404, "Tour not found");
  }

  return { tour };
};

export const actions: Actions = {
  update: async ({ request, params }) => {
    const { id } = params;
    const formData = await request.formData();

    const title = (formData.get("title") as string | null)?.trim() || "";
    const slug = (formData.get("slug") as string | null)?.trim() || "";
    const summary = (formData.get("summary") as string | null)?.trim() || "";
    const description = (formData.get("description") as string | null)?.trim() || "";
    const durationDaysRaw = (formData.get("durationDays") as string | null) || "";
    const pricingModeRaw = (formData.get("pricingMode") as string | null) || "";
    const maxGroupSizeRaw = (formData.get("maxGroupSize") as string | null) || "";
    const pickupTime = (formData.get("pickupTime") as string | null)?.trim() || "";
    const heroImageUrl = (formData.get("heroImageUrl") as string | null)?.trim() || "";
    const isActiveRaw = formData.get("isActive") as string | null;
    const isFeaturedRaw = formData.get("isFeatured") as string | null;
    const options = (formData.get("options") as string | null)?.trim() || "";

    const durationDays = durationDaysRaw ? Number(durationDaysRaw) : null;
    const pricingMode = pricingModeRaw ? Number(pricingModeRaw) : null;
    const maxGroupSize = maxGroupSizeRaw ? Number(maxGroupSizeRaw) : null;
    const isActive = isActiveRaw === "on" ? 1 : 0;
    const isFeatured = isFeaturedRaw === "on" ? 1 : 0;

    const fieldErrors: Record<string, string> = {};
    if (!title) fieldErrors.title = "Title is required.";
    if (!slug) fieldErrors.slug = "Slug is required.";
    if (!pricePerPerson) fieldErrors.pricePerPerson = "Price per person is required.";

    if (Object.keys(fieldErrors).length > 0) {
      return fail(400, {
        error: "Please correct the highlighted fields.",
        fieldErrors,
        values: {
          title,
          slug,
          summary,
          description,
          durationDays: durationDaysRaw,
          pricingMode: priceModeRaw,
          maxGroupSize: maxGroupSizeRaw,
          pickupTime,
          heroImageUrl,
          isActive: Boolean(isActive),
          isFeatured: Boolean(isFeatured),
          options
        }
      });
    }

    const { error: updateError } = await supabase
      .from("Tour")
      .update({
        title,
        slug,
        summary,
        description,
        durationDays,
        pricingMode,   // 👈 THIS is the important bit
        maxGroupSize,
        pickupTime,
        heroImageUrl,
        isActive,
        isFeatured,
        options,
        updatedAt: new Date().toISOString()
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating tour:", updateError);
      return fail(500, {
        error: "Failed to update tour.",
        values: {
          title,
          slug,
          summary,
          description,
          durationDays: durationDaysRaw,
          pricingMode: pricingModeRaw,
          maxGroupSize: maxGroupSizeRaw,
          pickupTime,
          heroImageUrl,
          isActive: Boolean(isActive),
          isFeatured: Boolean(isFeatured),
          options
        }
      });
    }

    throw redirect(303, "/admin/tours");
  }
};