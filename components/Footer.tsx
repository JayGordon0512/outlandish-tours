import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-highland-stone/80 mt-8 bg-highland-stone/40">
      <div className="outlandish-container py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-highland-ink/70">
        <p>© {new Date().getFullYear()} Outlandish Tours. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-highland-gold text-highland-ink">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-highland-gold text-highland-ink">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}