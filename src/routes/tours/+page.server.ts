// src/routes/tours/+page.server.ts
import type { PageServerLoad } from "./$types";
import { supabase } from "$lib/server/supabaseClient";

export const load: PageServerLoad = async () => {
  const { data: tours, error } = await supabase
    .from("Tour")
    .select("*")
    .eq("isActive", true)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error loading tours:", error);
  }

  return {
    tours: tours ?? [],
    error: error ? error.message : null
  };
};