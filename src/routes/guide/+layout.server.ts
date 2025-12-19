// src/routes/guide/+layout.server.ts
import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ cookies }) => {
  const raw = cookies.get("outlandish_session");

  if (!raw) {
    throw redirect(303, "/auth/login");
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed.isGuide) {
      // Logged in but not a guide → send to customer dashboard
      throw redirect(303, "/account");
    }

    const guideUser = {
      id: parsed.id as string,
      email: parsed.email as string,
      name: parsed.name ?? null
    };

    return { guideUser };
  } catch (e) {
    console.error("GUIDE LAYOUT: failed to parse session cookie:", e);
    throw redirect(303, "/auth/login");
  }
};