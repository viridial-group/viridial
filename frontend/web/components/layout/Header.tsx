'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu } from 'lucide-react';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { useTranslation } from '@/contexts/I18nContext';
import { SaasLogo } from '@/components/ui/SaasLogo';
import Image from 'next/image';
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
        {/* Logo Viridial avec Logo SaaS */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Logo SaaS - À gauche du logo Viridial */}
          <div 
            className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer group flex-shrink-0 flex items-center"
            title="Software as a Service - Plateforme SaaS"
            aria-label="SaaS Platform"
          >
            <SaasLogo size={26} simple className="group-hover:scale-110 transition-transform" />
          </div>
          
          {/* Logo et texte Viridial */}
          <Link 
            href="/" 
            className="hover:opacity-80 transition-opacity flex items-center gap-1.5 group"
            aria-label="Viridial - Page d'accueil"
          >
            <Image
              src="/viridial-logo.svg"
              alt="Viridial Logo"
              width={24}
              height={24}
              className="flex-shrink-0"
              priority
            />
            <span className="font-bold text-[19px] text-gray-900 whitespace-nowrap">
              Viridial
            </span>
          </Link>
        </div>

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
                    href="/subscription"
                    className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors font-semibold text-viridial-700"
                    onClick={() => setIsProductMenuOpen(false)}
                  >
                    Abonnement
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

