// src/routes/auth/login/+page.server.ts
import type { Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { supabase } from "$lib/server/supabaseClient";

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();

    const email = (formData.get("email") as string)?.trim().toLowerCase() || "";
    const password = (formData.get("password") as string) || "";

    if (!email || !password) {
      return fail(400, {
        error: "Please enter both email and password.",
        values: { email }
      });
    }

    // 1️⃣ Validate auth credentials with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData.user) {
      console.error("Login error:", authError);
      return fail(400, {
        error: "Invalid login credentials.",
        values: { email }
      });
    }

    const userId = authData.user.id;

    // 2️⃣ Get profile from your User table (isAdmin, isGuide, name)
    const { data: profileRow, error: profileError } = await supabase
      .from("User")
      .select("id, name, isAdmin, isGuide")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }

    let isAdmin = false;
    let isGuide = false;
    let name: string | null = null;

    if (profileRow) {
      isAdmin = !!profileRow.isAdmin;
      isGuide = !!profileRow.isGuide;
      name = profileRow.name ?? null;
    } else {
      // 3️⃣ If no profile row exists, create one
      const { data: inserted, error: insertError } = await supabase
        .from("User")
        .insert({
          id: userId,
          email,
          name: null,
          isAdmin: false,
          isGuide: false
        })
        .select("id, name, isAdmin, isGuide")
        .maybeSingle();

      if (insertError) {
        console.error("Insert profile error:", insertError);
      } else if (inserted) {
        isAdmin = !!inserted.isAdmin;
        isGuide = !!inserted.isGuide;
        name = inserted.name ?? null;
      }
    }

    // 4️⃣ Store session cookie
    const sessionValue = {
      id: userId,
      email,
      name,
      isAdmin,
      isGuide
    };

    cookies.set("outlandish_session", JSON.stringify(sessionValue), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set to true in production HTTPS
      maxAge: 60 * 60 * 24 * 7
    });

    console.log("LOGIN: session cookie =", sessionValue);

    // 5️⃣ Redirect users based on role
    if (isAdmin) {
      throw redirect(303, "/admin");
    }

    if (isGuide) {
      throw redirect(303, "/guide");
    }

    // Default customer dashboard
    throw redirect(303, "/account");
  }
};