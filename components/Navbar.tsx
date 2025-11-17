"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/tours", label: "Tours" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-highland-stone/80 bg-highland-offwhite/95 backdrop-blur sticky top-0 z-50">
      <div className="outlandish-container flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full border border-highland-gold flex items-center justify-center text-xs font-semibold tracking-[0.2em] text-highland-ink">
            OT
          </div>
          <div>
            <div className="font-semibold tracking-wide text-highland-ink">
              Outlandish Tours
            </div>
            <div className="text-xs text-highland-ink/60">
              Outlander-inspired Highlands adventures
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                hover:text-highland-gold transition
                ${pathname === item.href ? "text-highland-gold" : "text-highland-ink"}
              `}
            >
              {item.label}
            </Link>
          ))}

          {/* Simple static sign-in link (no session-based logic here) */}
          <Link
            href="/auth/login"
            className="px-3 py-1 rounded-full border border-highland-gold text-xs uppercase tracking-wide 
                       text-highland-ink bg-highland-offwhite
                       hover:bg-highland-gold hover:text-highland-offwhite transition"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
