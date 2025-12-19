// src/routes/+page.server.ts
import type { PageServerLoad } from "./$types";
import { supabase } from "$lib/server/supabaseClient";

export const load: PageServerLoad = async () => {
  // Load active tours for the homepage grid
  const { data: toursData, error: toursError } = await supabase
    .from("Tour")
    .select("*")
    .eq("isActive", true)
    .order("createdAt", { ascending: false });

  if (toursError) {
    console.error("Error loading tours for homepage:", toursError);
  }

  // Load single homepage content row
  const { data: homeContent, error: homeError } = await supabase
    .from("HomePageContent")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (homeError) {
    console.error("Error loading HomePageContent for homepage:", homeError);
  }

  return {
    tours: toursData ?? [],
    homeContent: homeContent ?? null,
    toursError: toursError ? toursError.message : null,
    homeError: homeError ? homeError.message : null
  };
};