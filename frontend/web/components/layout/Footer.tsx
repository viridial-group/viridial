'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-neutral-400)] bg-[var(--color-neutral-100)] mt-auto">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Solutions */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-primary)] mb-4">
              Solutions
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/for-agents"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Pour les agents
                </Link>
              </li>
              <li>
                <Link
                  href="/for-brands"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Pour les marques
                </Link>
              </li>
            </ul>
          </div>

          {/* Viridial */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-primary)] mb-4">
              Viridial
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Liens utiles */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-primary)] mb-4">
              Liens utiles
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Copyright */}
          <div className="md:col-span-4 pt-4 border-t border-[var(--color-neutral-400)]">
            <p className="text-xs text-[var(--color-muted)] text-center">
              © Copyright {new Date().getFullYear()} Viridial
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

