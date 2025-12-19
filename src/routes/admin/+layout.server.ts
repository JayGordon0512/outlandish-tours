// src/routes/admin/+layout.server.ts
import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

function getAdminFromCookie(cookies: any) {
  const raw = cookies.get("outlandish_session");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.isAdmin) return null;

    return {
      id: parsed.id as string,
      email: parsed.email as string,
      name: parsed.name ?? null,
      isAdmin: true
    };
  } catch {
    return null;
  }
}

export const load: LayoutServerLoad = async ({ cookies }) => {
  const admin = getAdminFromCookie(cookies);
  if (!admin) throw redirect(303, "/auth/login");
  return { admin };
};