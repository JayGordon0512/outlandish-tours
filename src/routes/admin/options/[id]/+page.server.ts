import type { PageServerLoad, Actions } from "./$types";
import { supabase } from "$lib/server/supabaseClient";
import { error, fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;

  const { data, error: dbError } = await supabase
    .from("ExtraOption")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (dbError) {
    console.error("Error loading extra option:", dbError);
    throw error(500, "Failed to load option");
  }

  if (!data) {
    throw error(404, "Option not found");
  }

  return {
    option: data
  };
};

export const actions: Actions = {
  save: async ({ request, params }) => {
    const { id } = params;
    const formData = await request.formData();
    const values = Object.fromEntries(formData);

    const name = values.name?.toString().trim() || "";
    const description = values.description?.toString().trim() || "";
    const priceRaw = values.price?.toString().trim();
    let chargeType = values.chargeType?.toString().trim() || "PerPerson";
    const isActiveRaw = values.isActive?.toString() || "1";

    if (!name) {
      return fail(400, {
        message: "Name is required"
      });
    }

    if (chargeType !== "PerPerson" && chargeType !== "PerTour") {
      chargeType = "PerPerson";
    }

    let price: number | null = null;
    if (priceRaw && !Number.isNaN(Number(priceRaw))) {
      price = Number(priceRaw);
    }

    const isActive =
      isActiveRaw === "1" || isActiveRaw === "true" || isActiveRaw === "on";

    const now = new Date().toISOString();

    const updateData: Record<string, any> = {
      name,
      description: description || null,
      price,
      chargeType,
      isActive,
      updatedAt: now
    };

    const { error: updateError } = await supabase
      .from("ExtraOption")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("Error updating extra option:", updateError);
      return fail(500, {
        message: "Failed to update option",
        dbError: updateError.message
      });
    }

    throw redirect(303, "/admin/options");
  },

  delete: async ({ params }) => {
    const { id } = params;

    if (!id) {
      return fail(400, { message: "Missing option id" });
    }

    // First remove any tour links to avoid FK issues
    const { error: linkError } = await supabase
      .from("TourExtraOption")
      .delete()
      .eq("extraOptionId", id);

    if (linkError) {
      console.error("Error deleting tour-option links:", linkError);
      return fail(500, {
        message: "Failed to delete option links",
        dbError: linkError.message
      });
    }

    const { error: optError } = await supabase
      .from("ExtraOption")
      .delete()
      .eq("id", id);

    if (optError) {
      console.error("Error deleting extra option:", optError);
      return fail(500, {
        message: "Failed to delete option",
        dbError: optError.message
      });
    }

    throw redirect(303, "/admin/options");
  }
};