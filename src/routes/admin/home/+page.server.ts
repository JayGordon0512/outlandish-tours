import type { PageServerLoad, Actions } from "./$types";
import { supabase } from "$lib/server/supabaseClient";
import { fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
  const { data: homeContent, error: homeError } = await supabase
    .from("HomePageContent")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (homeError) {
    console.error("Error loading HomePageContent:", homeError);
  }

  const { data: files, error: storageError } = await supabase.storage
    .from("images")
    .list("", {
      limit: 100,
      sortBy: { column: "name", order: "asc" }
    });

  if (storageError) {
    console.error("Error listing images from 'images' bucket:", storageError);
  }

  const imageOptions =
    files?.map((file) => {
      const { data: publicUrlData } = supabase
        .storage
        .from("images")
        .getPublicUrl(file.name);

      return {
        path: file.name,
        url: publicUrlData.publicUrl
      };
    }) ?? [];

  return {
    homeContent: homeContent ?? null,
    imageOptions,
    error: homeError ? homeError.message ?? "Failed to load homepage content." : null
  };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const intent = (formData.get("intent") as string | null) ?? "save_all";
    const isHeroOnly = intent === "save_hero";

    const id = (formData.get("id") as string | null) ?? null;

    const heroTitle =
      (formData.get("heroTitle") as string | null)?.trim() || null;
    const heroSubtitle =
      (formData.get("heroSubtitle") as string | null)?.trim() || null;

    const currentHeroImageUrl =
      (formData.get("currentHeroImageUrl") as string | null)?.trim() || null;

    const heroImageFile = formData.get("heroImageFile") as File | null;
    const heroImageExisting =
      (formData.get("heroImageExisting") as string | null)?.trim() || null;

    const heroPrimaryCtaLabel =
      (formData.get("heroPrimaryCtaLabel") as string | null)?.trim() || null;
    const heroPrimaryCtaHref =
      (formData.get("heroPrimaryCtaHref") as string | null)?.trim() || null;

    const heroSecondaryCtaLabel =
      (formData.get("heroSecondaryCtaLabel") as string | null)?.trim() || null;
    const heroSecondaryCtaHref =
      (formData.get("heroSecondaryCtaHref") as string | null)?.trim() || null;

    const introHeading =
      (formData.get("introHeading") as string | null)?.trim() || null;
    const introBody =
      (formData.get("introBody") as string | null)?.trim() || null;

    // Start from current hero image; override if user changes it
    let heroImageUrl: string | null = currentHeroImageUrl;

    // Upload new file (takes priority)
    if (heroImageFile && heroImageFile.size > 0) {
      try {
        const safeName = heroImageFile.name
          .toLowerCase()
          .replace(/[^a-z0-9\.]+/g, "-");

        const path = `hero/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(path, heroImageFile, {
            cacheControl: "3600",
            upsert: true
          });

        if (uploadError) {
          console.error("Hero image upload error:", uploadError);
        } else {
          const { data: publicUrlData } = supabase
            .storage
            .from("images")
            .getPublicUrl(path);

          heroImageUrl = publicUrlData.publicUrl ?? heroImageUrl;
        }
      } catch (err) {
        console.error("Unexpected error uploading hero image:", err);
      }
    } else if (heroImageExisting) {
      // Or use an existing image from the bucket
      const { data: publicUrlData } = supabase
        .storage
        .from("images")
        .getPublicUrl(heroImageExisting);

      heroImageUrl = publicUrlData.publicUrl ?? heroImageUrl;
    }

    // Validation: full save requires title + intro, hero-only does not
    if (!isHeroOnly && (!heroTitle || !introHeading)) {
      return fail(400, {
        error: "Hero title and intro heading are required.",
        values: {
          heroTitle,
          heroSubtitle,
          heroPrimaryCtaLabel,
          heroPrimaryCtaHref,
          heroSecondaryCtaLabel,
          heroSecondaryCtaHref,
          introHeading,
          introBody,
          heroImageUrl
        }
      });
    }

    // Map to your actual camelCase columns
    const payload = {
      heroTitle,
      heroSubtitle,
      heroImageUrl,
      heroPrimaryCtaLabel,
      heroPrimaryCtaHref,
      heroSecondaryCtaLabel,
      heroSecondaryCtaHref,
      introHeading,
      introBody,
      updatedAt: new Date().toISOString()
    };

    let supabaseError: any = null;

    if (id) {
      const { error } = await supabase
        .from("HomePageContent")
        .update(payload)
        .eq("id", id);

      supabaseError = error;
    } else {
      const { error } = await supabase
        .from("HomePageContent")
        .insert({
          ...payload,
          createdAt: new Date().toISOString()
        });

      supabaseError = error;
    }

    if (supabaseError) {
      console.error("Error saving HomePageContent:", supabaseError);
      return fail(500, {
        error: "Failed to save homepage content.",
        values: payload
      });
    }

    throw redirect(303, "/admin/home");
  }
};