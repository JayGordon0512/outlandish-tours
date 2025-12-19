// src/app.d.ts
// Make sure this file exists in src/
declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        email: string;
        name?: string | null;
      } | null;
    }
  }
}

export {};