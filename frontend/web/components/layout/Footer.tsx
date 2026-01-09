'use client';

import Link from 'next/link';
import { useTranslation } from '@/contexts/I18nContext';

export function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer 
      className="border-t border-gray-200 bg-gray-50 mt-auto"
      role="contentinfo"
      aria-label="Pied de page"
    >
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Solutions */}
          <nav aria-label="Solutions">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Solutions
            </h3>
            <ul className="space-y-2" role="list">
              <li>
                <Link
                  href="/for-agents"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-1"
                >
                  Pour les agents
                </Link>
              </li>
              <li>
                <Link
                  href="/for-brands"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-1"
                >
                  Pour les marques
                </Link>
              </li>
            </ul>
          </nav>

          {/* Viridial */}
          <nav aria-label="Viridial">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Viridial
            </h3>
            <ul className="space-y-2" role="list">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-1"
                >
                  {t('common.nav.about')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-1"
                >
                  {t('common.nav.contact')}
                </Link>
              </li>
              <li>
                <Link
                  href="/testimonials"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-1"
                >
                  {t('common.nav.testimonials')}
                </Link>
              </li>
              <li>
                <Link
                  href="/case-studies"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-1"
                >
                  {t('common.nav.caseStudies')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Ressources */}
          <nav aria-label="Ressources">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              {t('common.footer.resources')}
            </h3>
            <ul className="space-y-2" role="list">
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-1"
                >
                  {t('common.footer.blog')}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-1"
                >
                  {t('common.footer.faq')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Légal */}
          <nav aria-label="Légal">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              {t('common.footer.legal')}
            </h3>
            <ul className="space-y-2" role="list">
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-1"
                >
                  {t('common.footer.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:rounded-md focus:px-1"
                >
                  {t('common.footer.terms')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Copyright */}
          <div className="md:col-span-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © Copyright {new Date().getFullYear()} Viridial
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

