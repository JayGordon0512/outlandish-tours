import type { PageServerLoad, Actions } from "./$types";
import { supabase } from "$lib/server/supabaseClient";
import { fail, redirect } from "@sveltejs/kit";
import { randomUUID } from "node:crypto";

export const load: PageServerLoad = async () => {
  return {};
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const values = Object.fromEntries(formData);

    const name = values.name?.toString().trim() || "";
    const description = values.description?.toString().trim() || "";
    const priceRaw = values.price?.toString().trim();
    let chargeType = values.chargeType?.toString().trim() || "PerPerson";
    const isActiveRaw = values.isActive?.toString() || "1";

    if (!name) {
      return fail(400, {
        message: "Name is required",
        values
      });
    }

    // Ensure we only ever write valid enum values
    if (chargeType !== "PerPerson" && chargeType !== "PerTour") {
      chargeType = "PerPerson";
    }

    let price: number | null = null;
    if (priceRaw && !Number.isNaN(Number(priceRaw))) {
      price = Number(priceRaw);
    }

    const isActive =
      isActiveRaw === "1" || isActiveRaw === "true" || isActiveRaw === "on";

    const id = randomUUID();
    const now = new Date().toISOString();

    const insertData: Record<string, any> = {
      id,
      name,
      description: description || null,
      price,
      chargeType,
      isActive,
      createdAt: now,
      updatedAt: now
    };

    const { error } = await supabase.from("ExtraOption").insert(insertData);

    if (error) {
      console.error("Error creating extra option:", error);
      return fail(500, {
        message: "Failed to create option",
        dbError: error.message,
        values
      });
    }

    throw redirect(303, "/admin/options");
  }
};