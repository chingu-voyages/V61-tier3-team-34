"use client";
import Link from "next/link";
import Image from 'next/image';
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }

      if (e.key === "Tab" && menuRef.current) {
        const focusableElements = menuRef.current.querySelectorAll('a, button');
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 focus-ring rounded">
        <Image 
          src="/logo.DashFetch.png" 
          alt="Logo Ícone"
          width={24}               
          height={24}
          className="object-contain"
        />
        <span className="text-[#131E49] font-display font-bold text-xl tracking-tight">
            DashFetch
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/faq" className="hover:text-blue transition-colors focus-ring rounded">FAQ</Link>
          <Link href="/#contact" className="hover:text-blue transition-colors focus-ring rounded">Contact</Link>
          <Link href="/#about" className="hover:text-blue transition-colors focus-ring rounded">About</Link>
        </nav>

        {/* Mobile menu button */}
        <button
          ref={toggleRef}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus-ring"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <div className={`w-5 h-0.5 bg-gray-600 mb-1 transition-transform ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
          <div className={`w-5 h-0.5 bg-gray-600 mb-1 transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <div className={`w-5 h-0.5 bg-gray-600 transition-transform ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav 
          id="mobile-menu"
          ref={menuRef}
          className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-4 text-sm font-medium text-gray-600"
        >
          <Link href="/#faq" onClick={() => setMenuOpen(false)} className="hover:text-blue focus-ring rounded p-1">FAQ</Link>
          <Link href="/#contact" onClick={() => setMenuOpen(false)} className="hover:text-blue focus-ring rounded p-1">Contact</Link>
          <Link href="/#about" onClick={() => setMenuOpen(false)} className="hover:text-blue focus-ring rounded p-1">About</Link>
        </nav>
      )}
    </header>
  );
}
