export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import "./globals.css";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Outlandish Tours | Outlander-inspired Scottish Highlands Adventures",
  description:
    "Book cinematic, story-driven tours across the Scottish Highlands inspired by Outlander."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="outlandish-container">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}