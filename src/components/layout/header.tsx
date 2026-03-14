"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { CartIcon } from "@/components/cart/cart-icon";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/bikes" },
];

const categoryLinks = [
  { label: "Road Bikes", href: "/category/road", icon: "🏎️" },
  { label: "Mountain Bikes", href: "/category/mountain", icon: "⛰️" },
  { label: "Hybrid Bikes", href: "/category/hybrid", icon: "🔄" },
  { label: "Electric Bikes", href: "/category/electric", icon: "⚡" },
  { label: "Kids Bikes", href: "/category/kids", icon: "👶" },
  { label: "Cruiser Bikes", href: "/category/cruiser", icon: "🏖️" },
  { label: "Gravel Bikes", href: "/category/gravel", icon: "🌄" },
  { label: "BMX Bikes", href: "/category/bmx", icon: "🤸" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-[40px] left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-brand-dark/95 backdrop-blur-xl shadow-lg shadow-black/10 border-b border-white/5"
          : "bg-brand-dark"
      )}
    >
      {/* Top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-brand-accent to-transparent" />

      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-accent to-amber-600 flex items-center justify-center shadow-glow-amber group-hover:shadow-glow-amber-lg transition-shadow duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path d="M15 6a1 1 0 100-2 1 1 0 000 2z" fill="white" />
                <path d="M12 17.5V14l-3.5-3.5 2-2 5 5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none">
                <span className="text-brand-accent">DevEx</span>{" "}
                <span className="text-white">Bike Shop</span>
              </span>
            </div>
            <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-brand-accent/15 text-brand-accent border border-brand-accent/25 leading-none">
              Demo
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "nav-link px-3 py-2 rounded-lg",
                  pathname === link.href && "nav-link-active"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="relative">
              <button
                onClick={() => setCatOpen(!catOpen)}
                onBlur={() => setTimeout(() => setCatOpen(false), 200)}
                className={cn(
                  "nav-link flex items-center gap-1.5 px-3 py-2 rounded-lg",
                  catOpen && "nav-link-active"
                )}
              >
                Categories
                <svg
                  className={cn("h-3.5 w-3.5 transition-transform duration-200", catOpen && "rotate-180")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-xl bg-brand-dark/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/30 py-2 animate-fade-in-down">
                  {categoryLinks.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      onClick={() => setCatOpen(false)}
                    >
                      <span className="text-base">{cat.icon}</span>
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/search"
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="Search"
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <Link
              href="/wishlist"
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="Wishlist"
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>
            <CartIcon />
            <Link
              href="/account"
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="Account"
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Divider */}
            <div className="hidden md:block w-px h-6 bg-white/10 mx-1" />

            {/* Admin link */}
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-brand-accent hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-brand-accent/20"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-brand-dark/98 backdrop-blur-xl animate-fade-in-down">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  pathname === link.href
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/5 my-2" />
            <span className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Categories
            </span>
            {categoryLinks.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all"
              >
                <span>{cat.icon}</span>
                {cat.label}
              </Link>
            ))}
            <div className="border-t border-white/5 my-2" />
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-brand-accent transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Panel
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
