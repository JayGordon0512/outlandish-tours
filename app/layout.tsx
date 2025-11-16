// app/layout.tsx
export const dynamic = "force-dynamic";

import "./globals.css";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title:
    "Outlandish Tours | Outlander-inspired Scottish Highlands Adventures",
  description:
    "Book cinematic, story-driven tours across the Scottish Highlands inspired by Outlander.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar session={session} />
        <main className="flex-1 py-8">
          <div className="outlandish-container">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}