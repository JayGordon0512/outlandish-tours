// src/routes/admin/options/+page.server.ts
import type { PageServerLoad, Actions } from "./$types";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "$env/static/private";
import { fail, redirect } from "@sveltejs/kit";
import crypto from "node:crypto";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

function getAdminFromCookie(cookies: any) {
  const raw = cookies.get("outlandish_session");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.isAdmin) return null;
    return parsed;
  } catch {
    return null;
  }
}

const allowedChargeTypes = new Set(["PER_TOUR", "PER_PERSON"]);

export const load: PageServerLoad = async ({ cookies }) => {
  const admin = getAdminFromCookie(cookies);
  if (!admin) throw redirect(303, "/auth/login");

  const { data: options, error } = await supabase
    .from("ExtraOption")
    .select("id,name,description,price,chargeType,isActive,createdAt,updatedAt")
    .order("createdAt", { ascending: false });

  if (error) console.error("Error loading ExtraOption:", error);

  return {
    admin,
    options: options ?? []
  };
};

export const actions: Actions = {
  create: async ({ request, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) throw redirect(303, "/auth/login");

    const formData = await request.formData();

    const name = (formData.get("name") as string | null)?.trim() ?? "";
    const description = ((formData.get("description") as string | null)?.trim() || null) as string | null;

    const priceRaw = (formData.get("price") as string | null)?.trim() ?? "";
    const price = Number.parseInt(priceRaw, 10);

    const chargeType = (formData.get("chargeType") as string | null)?.trim() ?? "";
    const isActive = formData.get("isActive") === "on";

    if (!name || !Number.isFinite(price) || !chargeType) {
      return fail(400, {
        error: "Name, price and charge type are required.",
        values: { name, description: description ?? "", price: priceRaw, chargeType, isActive }
      });
    }

    if (!allowedChargeTypes.has(chargeType)) {
      return fail(400, {
        error: "Invalid charge type.",
        values: { name, description: description ?? "", price: priceRaw, chargeType, isActive }
      });
    }

    const nowIso = new Date().toISOString();

    const { error } = await supabase.from("ExtraOption").insert({
      id: crypto.randomUUID(),
      name,
      description,
      price,
      chargeType,
      isActive,
      updatedAt: nowIso
    });

    if (error) {
      console.error("Error creating ExtraOption:", error);
      return fail(500, { error: "Failed to create option." });
    }

    throw redirect(303, "/admin/options");
  },

  update: async ({ request, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) throw redirect(303, "/auth/login");

    const formData = await request.formData();

    const id = (formData.get("id") as string | null)?.trim() ?? "";
    if (!id) return fail(400, { error: "Missing option id." });

    const name = (formData.get("name") as string | null)?.trim() ?? "";
    const description = ((formData.get("description") as string | null)?.trim() || null) as string | null;

    const priceRaw = (formData.get("price") as string | null)?.trim() ?? "";
    const price = Number.parseInt(priceRaw, 10);

    const chargeType = (formData.get("chargeType") as string | null)?.trim() ?? "";
    const isActive = formData.get("isActive") === "on";

    if (!name || !Number.isFinite(price) || !chargeType) {
      return fail(400, { error: "Name, price and charge type are required." });
    }

    if (!allowedChargeTypes.has(chargeType)) {
      return fail(400, { error: "Invalid charge type." });
    }

    const { error } = await supabase
      .from("ExtraOption")
      .update({
        name,
        description,
        price,
        chargeType,
        isActive,
        updatedAt: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating ExtraOption:", error);
      return fail(500, { error: "Failed to update option." });
    }

    throw redirect(303, "/admin/options");
  },

  toggleActive: async ({ request, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) throw redirect(303, "/auth/login");

    const formData = await request.formData();
    const id = (formData.get("id") as string | null)?.trim() ?? "";
    const nextActive = (formData.get("nextActive") as string | null)?.trim() ?? "";

    if (!id || (nextActive !== "true" && nextActive !== "false")) {
      return fail(400, { error: "Missing option id or state." });
    }

    const { error } = await supabase
      .from("ExtraOption")
      .update({ isActive: nextActive === "true", updatedAt: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error toggling ExtraOption:", error);
      return fail(500, { error: "Failed to update option." });
    }

    throw redirect(303, "/admin/options");
  },

  delete: async ({ request, cookies }) => {
    const admin = getAdminFromCookie(cookies);
    if (!admin) throw redirect(303, "/auth/login");

    const formData = await request.formData();
    const id = (formData.get("id") as string | null)?.trim() ?? "";
    if (!id) return fail(400, { error: "Missing option id." });

    const { error } = await supabase.from("ExtraOption").delete().eq("id", id);

    if (error) {
      console.error("Error deleting ExtraOption:", error);
      return fail(500, { error: "Failed to delete option." });
    }

    throw redirect(303, "/admin/options");
  }
};