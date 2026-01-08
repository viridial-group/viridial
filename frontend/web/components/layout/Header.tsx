'use client';

import Link from 'next/link';
import { ChevronDown, Menu } from 'lucide-react';

export function Header() {
  return (
    <nav className="sticky top-0 z-40 md:py-3 max-w-[1600px]">
      <div className="h-[70px] lg:h-auto container mx-auto backdrop-blur-md bg-white/80 flex items-center border-b lg:border border-[#D8D8D8] lg:rounded-[100px] px-4 lg:px-6 py-1.5 relative">
        {/* Logo */}
        <Link href="/" className="hover:opacity-80 transition-opacity flex-shrink-0">
          <div className="flex items-center gap-1">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.99976 11.8283C3.99976 11.8283 4.99975 10.1271 6.08561 9.74245C8.26486 8.97043 8.12224 13.3097 10.605 13.5665C13.6606 13.8826 12.5891 8.14646 15.472 8.00424C19.0544 7.8275 18.6007 13.2189 19.9913 16"
                stroke="#FF3B30"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-bold text-[19px] text-[var(--color-primary)]">
              Viridial
            </span>
          </div>
        </Link>

        {/* Navigation - Centered on desktop */}
        <ul className="hidden lg:flex gap-4 font-medium absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <li className="relative">
            <button className="flex items-center gap-1 hover:opacity-70 transition-opacity text-[var(--color-primary)]">
              Produit
              <ChevronDown className="w-4 h-4" />
            </button>
          </li>
          <li>
            <Link
              href="/search"
              className="text-[var(--color-primary)] hover:opacity-70 transition-opacity"
            >
              Recherche
            </Link>
          </li>
          <li>
            <Link
              href="/browse"
              className="text-[var(--color-primary)] hover:opacity-70 transition-opacity"
            >
              Propriétés
            </Link>
          </li>
          <li>
            <Link
              href="/features"
              className="text-[var(--color-primary)] hover:opacity-70 transition-opacity"
            >
              Fonctionnalités
            </Link>
          </li>
          <li>
            <Link
              href="/pricing"
              className="text-[var(--color-primary)] hover:opacity-70 transition-opacity"
            >
              Tarifs
            </Link>
          </li>
        </ul>

        {/* Actions - Desktop */}
        <div className="hidden lg:flex gap-2 ml-auto flex-shrink-0">
          <Link
            href="/dashboard"
            className="p-4 rounded-[100px] font-medium transition-all duration-200 flex items-center cursor-pointer bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90 shadow-md"
          >
            Accéder à l'app
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden ml-auto flex items-center flex-shrink-0">
          <button className="p-2 hover:opacity-70 transition-opacity">
            <Menu className="w-6 h-6 text-[var(--color-primary)]" />
          </button>
        </div>
      </div>
    </nav>
  );
}

