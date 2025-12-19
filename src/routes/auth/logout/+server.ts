// src/routes/auth/logout/+server.ts
import type { RequestHandler } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ cookies }) => {
  const before = cookies.get("outlandish_session");
  console.log("LOGOUT POST: cookie before delete =", before);

  cookies.delete("outlandish_session", {
    path: "/"
  });

  const after = cookies.get("outlandish_session");
  console.log("LOGOUT POST: cookie after delete =", after);

  throw redirect(303, "/");
};