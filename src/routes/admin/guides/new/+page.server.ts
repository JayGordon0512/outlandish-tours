// src/routes/admin/guides/new/+page.server.ts
import type { PageServerLoad, Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { supabase } from "$lib/server/supabaseClient";

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
    console.error("Failed to parse outlandish_session in guides/new:", e);
    return null;
  }
}

// Friendly IDs like G-AB12CD
function createFriendlyGuideId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `G-${out}`;
}

export const load: PageServerLoad = async ({ cookies }) => {
  const admin = getAdminFromCookie(cookies);
  if (!admin) {
    throw redirect(303, "/auth/login");
  }

  return {
    admin
  };
};

export const actions: Actions = {
  uploadPhoto: async ({ request, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) {
      throw redirect(303, "/auth/login");
    }

    const formData = await request.formData();
    const file = formData.get("photo") as File | null;

    if (!file || file.size === 0) {
      return fail(400, {
        uploadError: "Please choose a photo to upload."
      });
    }

    const bucket = "images"; // your Supabase bucket
    const ext = file.name.split(".").pop() || "jpg";
    const objectPath = `guides/${crypto.randomUUID()}.${ext}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(objectPath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        console.error("Error uploading guide photo:", uploadError);
        return fail(500, {
          uploadError: "Could not upload image. Please try again."
        });
      }

      const {
        data: { publicUrl }
      } = supabase.storage.from(bucket).getPublicUrl(objectPath);

      return {
        uploadedPhotoUrl: publicUrl
      };
    } catch (e) {
      console.error("Unexpected error uploading guide photo:", e);
      return fail(500, {
        uploadError: "Could not upload image. Please try again."
      });
    }
  },

  createGuide: async ({ request, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) {
      throw redirect(303, "/auth/login");
    }

    const formData = await request.formData();

    const firstName = (formData.get("firstName") as string | null)?.trim() || "";
    const lastName = (formData.get("lastName") as string | null)?.trim() || "";
    const email =
      (formData.get("email") as string | null)?.trim().toLowerCase() || "";
    const mobile = (formData.get("mobile") as string | null)?.trim() || "";
    const address = (formData.get("address") as string | null)?.trim() || "";
    const photoUrl = (formData.get("photoUrl") as string | null)?.trim() || "";
    const isActiveRaw = (formData.get("isActive") as string | null) ?? "on";
    const isActive =
      isActiveRaw === "on" || isActiveRaw === "true" || isActiveRaw === "1";

    const values = { firstName, lastName, email, mobile, address, photoUrl, isActive };
    const fieldErrors: Record<string, string> = {};

    if (!firstName) fieldErrors.firstName = "Please enter first name.";
    if (!lastName) fieldErrors.lastName = "Please enter last name.";
    if (!email) fieldErrors.email = "Please enter an email.";

    if (Object.keys(fieldErrors).length > 0) {
      return fail(400, {
        error: "Please correct the highlighted fields.",
        fieldErrors,
        values
      });
    }

    const nowIso = new Date().toISOString();
    const fullName = `${firstName} ${lastName}`.trim();

    // 1) Ensure there is a matching row in User
    let userId: string;

    const { data: existingUser, error: existingUserError } = await supabase
      .from("User")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUserError) {
      console.error("Error checking existing User for guide:", existingUserError);
      return fail(500, {
        error: "Could not check existing user account.",
        values
      });
    }

    if (existingUser?.id) {
      userId = existingUser.id;
    } else {
      userId = crypto.randomUUID();

      const { error: userInsertError } = await supabase.from("User").insert({
        id: userId,
        email,
        name: fullName,
        isAdmin: false,
        createdAt: nowIso,
        updatedAt: nowIso
      });

      if (userInsertError) {
        console.error("Error inserting User row for guide:", userInsertError);
        return fail(500, {
          error: "Could not create user record for guide.",
          values
        });
      }
    }

    // 2) Try to create Supabase Auth user for guide login (non-fatal if it already exists)
    try {
      const randomPassword = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
      const { error: authError } = await supabase.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          name: fullName,
          role: "guide"
        }
      });

      if (authError) {
        console.warn(
          "Supabase Auth user for guide could not be created (may already exist):",
          authError
        );
      }
    } catch (e) {
      console.error("Unexpected error creating Supabase Auth user for guide:", e);
    }

    // 3) Insert the Guide row
    const guideId = createFriendlyGuideId();

    const { error: guideError } = await supabase.from("Guide").insert({
      id: guideId,
      firstName,
      lastName,
      email,
      mobile,
      address,
      userId,
      photoUrl: photoUrl || null,
      createdAt: nowIso,
      updatedAt: nowIso
    });

    if (guideError) {
      console.error("Error inserting Guide row:", guideError);
      return fail(500, {
        error: "Could not create guide.",
        values
      });
    }

    throw redirect(303, "/admin/guides");
  }
};