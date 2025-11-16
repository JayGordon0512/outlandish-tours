// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata = {
  title: "Outlandish Tours | Outlander-inspired Scottish Highlands Adventures",
  description:
    "Book cinematic, story-driven tours across the Scottish Highlands inspired by Outlander."
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  let session = null;

  // IMPORTANT: never let auth() throw during build
  try {
    session = await auth();
  } catch (err) {
    // In build / error cases, just treat as logged-out
    session = null;
  }

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