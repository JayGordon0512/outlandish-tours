
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies }) => {
  const raw = cookies.get("outlandish_session");

  if (!raw) {
    console.log("LAYOUT.SERVER: raw outlandish_session cookie = undefined");
    console.log("LAYOUT.SERVER: no session cookie, user = null");
    return { user: null };
  }

  try {
    console.log("LAYOUT.SERVER: raw outlandish_session cookie =", raw);
    const parsed = JSON.parse(raw);

    const user = {
      id: parsed.id as string,
      email: parsed.email as string,
      name: parsed.name ?? null,
      isAdmin: Boolean(parsed.isAdmin),
      isGuide: Boolean(parsed.isGuide)   // 👈 NEW
    };

    console.log("LAYOUT.SERVER: user =", user);
    return { user };
  } catch (e) {
    console.error("Failed to parse outlandish_session cookie:", e);
    return { user: null };
  }
};