'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Auth Guard Component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if still loading auth state
    if (isLoading) {
      return;
    }

    // Don't redirect if already on login/signup pages
    if (pathname?.includes('/login') || pathname?.includes('/signup')) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}


