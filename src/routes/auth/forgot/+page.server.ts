import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { supabase } from "$lib/server/supabaseClient";

const siteUrl = process.env.PUBLIC_SITE_URL || "http://localhost:5173";

export const load: PageServerLoad = async () => {
  return {};
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = (formData.get("email") as string | null)?.trim().toLowerCase() || "";

    const values = { email };
    const fieldErrors: Record<string, string> = {};

    if (!email) {
      fieldErrors.email = "Please enter your email.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return fail(400, {
        error: "Please correct the highlighted fields.",
        fieldErrors,
        values
      });
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/reset`
      });

      if (error) {
        console.error("Error sending reset password email:", error);
      }
    } catch (e) {
      console.error("Unexpected error in resetPasswordForEmail:", e);
    }

    return {
      sent: true,
      values
    };
  }
};