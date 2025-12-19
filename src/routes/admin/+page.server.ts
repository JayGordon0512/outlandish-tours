import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent();

  if (!user || !user.isAdmin) {
    throw redirect(303, "/auth/login");
  }

  return {};
};