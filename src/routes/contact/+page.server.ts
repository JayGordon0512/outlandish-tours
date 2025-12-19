// src/routes/contact/+page.server.ts
import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { supabase } from "$lib/server/supabaseClient";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const load: PageServerLoad = async () => {
  return { ok: false };
};

export const actions: Actions = {
  default: async ({ request, getClientAddress, url }) => {
    const formData = await request.formData();

    // Honeypot (bots fill this)
    const company = (formData.get("company") as string | null)?.trim() ?? "";
    if (company) {
      return fail(400, { error: "Something went wrong.", values: {} });
    }

    const name = (formData.get("name") as string | null)?.trim() ?? "";
    const email = (formData.get("email") as string | null)?.trim() ?? "";
    const subject = (formData.get("subject") as string | null)?.trim() ?? "";
    const message = (formData.get("message") as string | null)?.trim() ?? "";

    const values = { name, email, subject, message };

    const fieldErrors: Record<string, string> = {};
    if (!name) fieldErrors.name = "Please enter your name.";
    if (!email) fieldErrors.email = "Please enter your email.";
    if (email && !emailRegex.test(email)) fieldErrors.email = "Please enter a valid email.";
    if (!message) fieldErrors.message = "Please enter a message.";

    if (Object.keys(fieldErrors).length) {
      return fail(400, { error: "Please correct the highlighted fields.", fieldErrors, values });
    }

    const ip = getClientAddress?.() ?? null;

    const ua = request.headers.get("user-agent") ?? null;

    const { error } = await supabase.from("ContactMessage").insert({
      name,
      email,
      subject: subject || null,
      message,
      page: url.pathname,
      user_agent: ua,
      ip
    });

    if (error) {
      console.error("ContactMessage insert error:", error);
      return fail(500, { error: "Failed to send message. Please try again.", values });
    }

    return { ok: true };
  }
};