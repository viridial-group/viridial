'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu } from 'lucide-react';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { useTranslation } from '@/contexts/I18nContext';
import { SassLogo } from '@/components/ui/SassLogo';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function Header() {
  const { t } = useTranslation();
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  
  return (
    <nav 
      className="sticky top-0 z-40 md:py-3 max-w-[1600px]"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="h-[70px] lg:h-auto container mx-auto backdrop-blur-md bg-white/80 flex items-center border-b lg:border border-[#D8D8D8] lg:rounded-[100px] px-4 lg:px-6 py-1.5 relative">
        {/* Logo */}
        <Link 
          href="/" 
          className="hover:opacity-80 transition-opacity flex-shrink-0"
          aria-label="Viridial - Page d'accueil"
        >
          <div className="flex items-center gap-1">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3.99976 11.8283C3.99976 11.8283 4.99975 10.1271 6.08561 9.74245C8.26486 8.97043 8.12224 13.3097 10.605 13.5665C13.6606 13.8826 12.5891 8.14646 15.472 8.00424C19.0544 7.8275 18.6007 13.2189 19.9913 16"
                stroke="#FF3B30"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-bold text-[19px] text-gray-900">
              Viridial
            </span>
          </div>
        </Link>

        {/* Navigation - Centered on desktop */}
        <ul 
          className="hidden lg:flex gap-4 font-medium absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          role="list"
        >
          <li className="relative">
            <Popover open={isProductMenuOpen} onOpenChange={setIsProductMenuOpen}>
              <PopoverTrigger asChild>
                <button 
                  className="flex items-center gap-1 hover:opacity-70 transition-opacity text-gray-900 focus:outline-none focus:ring-2 focus:ring-viridial-500 focus:ring-offset-2 focus:rounded-md focus:px-2 focus:py-1"
                  aria-label={t('common.nav.product')}
                  aria-expanded={isProductMenuOpen}
                  aria-haspopup="true"
                >
                  {t('common.nav.product')}
                  <ChevronDown className={`w-4 h-4 transition-transform ${isProductMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="start">
                <nav className="flex flex-col">
                  <Link
                    href="/features"
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => setIsProductMenuOpen(false)}
                  >
                    {t('common.nav.features')}
                  </Link>
                  <Link
                    href="/pricing"
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => setIsProductMenuOpen(false)}
                  >
                    {t('common.nav.pricing')}
                  </Link>
                  <Link
                    href="/about"
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => setIsProductMenuOpen(false)}
                  >
                    {t('common.nav.about')}
                  </Link>
                  <Link
                    href="/contact"
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => setIsProductMenuOpen(false)}
                  >
                    {t('common.nav.contact')}
                  </Link>
                  <Link
                    href="/testimonials"
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => setIsProductMenuOpen(false)}
                  >
                    {t('common.nav.testimonials')}
                  </Link>
                  <Link
                    href="/case-studies"
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => setIsProductMenuOpen(false)}
                  >
                    {t('common.nav.caseStudies')}
                  </Link>
                </nav>
              </PopoverContent>
            </Popover>
          </li>
          <li>
            <Link
              href="/search"
              className="text-gray-900 hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-viridial-500 focus:ring-offset-2 focus:rounded-md focus:px-2 focus:py-1"
            >
              {t('common.nav.search')}
            </Link>
          </li>
          <li>
            <Link
              href="/browse"
              className="text-gray-900 hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-viridial-500 focus:ring-offset-2 focus:rounded-md focus:px-2 focus:py-1"
            >
              {t('common.nav.properties')}
            </Link>
          </li>
          <li>
            <Link
              href="/neighborhoods"
              className="text-gray-900 hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-viridial-500 focus:ring-offset-2 focus:rounded-md focus:px-2 focus:py-1"
            >
              {t('common.nav.neighborhoods')}
            </Link>
          </li>
        </ul>

        {/* Actions - Desktop */}
        <div className="hidden lg:flex gap-3 ml-auto flex-shrink-0 items-center">
          {/* Logo SASS - Badge technologique (visible uniquement sur grands écrans) */}
          <div 
            className="hidden xl:flex opacity-60 hover:opacity-100 transition-opacity cursor-pointer group"
            title="Construit avec SASS"
            aria-label="Technologie SASS"
          >
            <SassLogo size={32} simple className="group-hover:scale-110" />
          </div>
          <LanguageSelector />
          <Link
            href="/dashboard"
            className="p-4 rounded-full font-medium transition-all duration-200 flex items-center cursor-pointer bg-gradient-to-r from-viridial-600 to-viridial-500 text-white hover:from-viridial-700 hover:to-viridial-600 shadow-sm hover:shadow-md"
          >
            {t('common.nav.accessApp')}
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden ml-auto flex items-center gap-2 flex-shrink-0">
          {/* Logo SASS - Mobile (version compacte, visible uniquement sur tablettes) */}
          <div 
            className="hidden md:flex opacity-60" 
            title="SASS"
            aria-label="Technologie SASS"
          >
            <SassLogo size={24} simple />
          </div>
          <button 
            className="p-2 hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-viridial-500 focus:ring-offset-2 focus:rounded-md"
            aria-label="Ouvrir le menu de navigation"
            aria-expanded="false"
            aria-controls="mobile-menu"
          >
            <Menu className="w-6 h-6 text-gray-900" aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
}

