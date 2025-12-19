import type { PageServerLoad, Actions } from "./$types";
import { supabase } from "$lib/server/supabaseClient";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
  const { data, error } = await supabase
    .from("Tour")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error loading tours:", error);
    return {
      tours: [],
      error: "Failed to load tours"
    };
  }

  return {
    tours: data ?? [],
    error: null
  };
};

export const actions: Actions = {
  toggleStatus: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id")?.toString();
    const current = formData.get("current")?.toString();

    if (!id) {
      return fail(400, { message: "Missing tour id" });
    }

    const currentlyActive =
      current === "1" || current === "true" || current === "on";

    const isActive = currentlyActive ? 0 : 1;
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("Tour")
      .update({ isActive, updatedAt: now })
      .eq("id", id);

    if (error) {
      console.error("Error toggling tour status:", error);
      return fail(500, { message: "Failed to update tour status" });
    }

    return { success: true };
  }
};