// src/routes/contact/+page.server.ts
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const tourId = url.searchParams.get("tourId");
  const tourTitle = url.searchParams.get("tourTitle");

  return {
    tourId,
    tourTitle
  };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const name = (formData.get("name") as string | null)?.trim() || "";
    const email = (formData.get("email") as string | null)?.trim() || "";
    const message = (formData.get("message") as string | null)?.trim() || "";
    const tourId = (formData.get("tourId") as string | null)?.trim() || "";
    const tourTitle = (formData.get("tourTitle") as string | null)?.trim() || "";
    const preferredDate =
      (formData.get("preferredDate") as string | null)?.trim() || "";
    const guestsRaw =
      (formData.get("guests") as string | null)?.trim() || "";

    const guests = guestsRaw ? Number(guestsRaw) : null;

    // For now we just pretend to handle it successfully.
    // Later we can insert into a "Enquiry" table or send an email.
    if (!name || !email || !message) {
      return {
        success: false,
        error: "Please fill in your name, email and a message.",
        values: {
          name,
          email,
          message,
          tourId,
          tourTitle,
          preferredDate,
          guests
        }
      };
    }

    return {
      success: true
    };
  }
};