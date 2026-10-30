"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Brand, buttonStyles } from "@/components/ui";

// Active on press: a button that gives no feedback feels broken on a phone.
const press = "active:scale-[0.97] motion-safe:transition-transform";

/**
 * Never painted at the top: the page's own gradient shows straight through it, so
 * there is no seam. Once the page scrolls it becomes light frosted glass with no
 * border. The tint is what keeps the dark logo and links readable when the dark
 * "How it works" and contact sections pass underneath.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 motion-safe:transition-[background-color,backdrop-filter] motion-safe:duration-300 ${
        scrolled ? "bg-white/60 backdrop-blur-xl backdrop-saturate-150" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-3 rounded-xl" aria-label="ChimBill home">
          <Brand tagline="Rent & utility management" />
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="transition hover:text-slate-900">
            Features
          </a>
          <a href="#workflow" className="transition hover:text-slate-900">
            How it works
          </a>
          <a href="#faq" className="transition hover:text-slate-900">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin/login"
            className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-xl px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-900/5 ${press}`}
          >
            Owner login
          </Link>
          {/* Wrapped, because the button's own display class beats `hidden`. */}
          <div className="hidden sm:block">
            <a href="#contact" className={`${buttonStyles.primary} ${press} shadow-sm shadow-brand/30`}>
              Get in touch
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
