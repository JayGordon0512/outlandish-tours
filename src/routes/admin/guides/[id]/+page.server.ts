// src/routes/admin/guides/[id]/+page.server.ts
import type { PageServerLoad, Actions } from "./$types";
import { error, fail, redirect } from "@sveltejs/kit";
import { supabase } from "$lib/server/supabaseClient";

const GUIDE_PHOTOS_BUCKET = "images"; // 👈 make sure this matches your existing bucket name

type ActionData = {
  values?: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    address: string;
  };
  fieldErrors?: Record<string, string>;
  error?: string;
};

function getAdminFromCookie(cookies: any) {
  const raw = cookies.get("outlandish_session");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.isAdmin) return null;
    return {
      id: parsed.id as string,
      email: parsed.email as string,
      name: parsed.name ?? null,
      isAdmin: true
    };
  } catch (e) {
    console.error("Failed to parse outlandish_session in admin guide edit:", e);
    return null;
  }
}

export const load: PageServerLoad = async ({ params, cookies }) => {
  const admin = getAdminFromCookie(cookies);
  if (!admin) {
    throw redirect(303, "/auth/login");
  }

  const guideId = params.id;
  if (!guideId) {
    throw error(400, "Missing guide id");
  }

  const { data: guide, error: guideError } = await supabase
    .from("Guide")
    .select("*")
    .eq("id", guideId)
    .maybeSingle();

  if (guideError) {
    console.error("Error loading guide:", guideError);
    throw error(500, "Failed to load guide");
  }

  if (!guide) {
    throw error(404, "Guide not found");
  }

  return {
    admin,
    guide
  };
};

export const actions: Actions = {
  save: async ({ params, request, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) {
      throw redirect(303, "/auth/login");
    }

    const guideId = params.id;
    if (!guideId) {
      return fail(400, { error: "Missing guide id" } as ActionData);
    }

    const formData = await request.formData();

    const firstName = (formData.get("firstName") as string | null)?.trim() ?? "";
    const lastName = (formData.get("lastName") as string | null)?.trim() ?? "";
    const email = (formData.get("email") as string | null)?.trim() ?? "";
    const mobile = (formData.get("mobile") as string | null)?.trim() ?? "";
    const address = (formData.get("address") as string | null)?.trim() ?? "";

    const values: ActionData["values"] = {
      firstName,
      lastName,
      email,
      mobile,
      address
    };

    const fieldErrors: Record<string, string> = {};

    if (!firstName) fieldErrors.firstName = "First name is required.";
    if (!lastName) fieldErrors.lastName = "Last name is required.";
    if (!email) fieldErrors.email = "Email is required.";

    if (Object.keys(fieldErrors).length > 0) {
      return fail(400, {
        error: "Please correct the highlighted fields.",
        fieldErrors,
        values
      } as ActionData);
    }

    const { error: updateError } = await supabase
      .from("Guide")
      .update({
        firstName,
        lastName,
        email,
        mobile,
        address,
        updatedAt: new Date().toISOString()
      })
      .eq("id", guideId);

    if (updateError) {
      console.error("Error updating guide:", updateError);
      return fail(500, {
        error: "Could not update guide. Please try again.",
        values
      } as ActionData);
    }

    throw redirect(303, `/admin/guides/${guideId}`);
  },

  delete: async ({ params, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) {
      throw redirect(303, "/auth/login");
    }

    const guideId = params.id;
    if (!guideId) {
      return fail(400, { error: "Missing guide id" } as ActionData);
    }

    const { error: deleteError } = await supabase
      .from("Guide")
      .delete()
      .eq("id", guideId);

    if (deleteError) {
      console.error("Error deleting guide:", deleteError);
      return fail(500, { error: "Could not delete guide." } as ActionData);
    }

    throw redirect(303, "/admin/guides");
  },

  updatePhoto: async ({ params, request, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) {
      throw redirect(303, "/auth/login");
    }

    const guideId = params.id;
    if (!guideId) {
      return fail(400, { error: "Missing guide id" } as ActionData);
    }

    const formData = await request.formData();
    const file = formData.get("photo");

    if (!(file instanceof File) || !file.size) {
      return fail(400, {
        error: "Please choose a photo file to upload."
      } as ActionData);
    }

    const fileExt = file.name.split(".").pop() ?? "jpg";
    const filePath = `${guideId}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(GUIDE_PHOTOS_BUCKET)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      console.error("Error uploading guide photo:", uploadError);
      return fail(500, {
        error: "Could not upload photo. Please try again."
      } as ActionData);
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from(GUIDE_PHOTOS_BUCKET).getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("Guide")
      .update({
        photoUrl: publicUrl,
        updatedAt: new Date().toISOString()
      })
      .eq("id", guideId);

    if (updateError) {
      console.error("Error updating guide photoUrl:", updateError);
      return fail(500, {
        error: "Photo uploaded, but failed to update guide record."
      } as ActionData);
    }

    throw redirect(303, `/admin/guides/${guideId}`);
  }
};