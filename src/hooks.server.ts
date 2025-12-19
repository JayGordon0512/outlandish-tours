// src/hooks.server.ts
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const cookie = event.cookies.get("outlandish_session");

  if (cookie) {
    try {
      event.locals.user = JSON.parse(cookie);
    } catch {
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  const response = await resolve(event);
  return response;
};