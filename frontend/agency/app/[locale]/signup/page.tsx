'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/i18n/routing';
import { SignupForm } from '@/components/auth/SignupForm';
import { LanguageSelector } from '@/components/ui/language-selector';

export default function SignupPage() {
  const t = useTranslations('auth');
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-viridial-600"></div>
      </div>
    );
  }

  // Don't render signup form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {t('signup.title')}
          </h1>
          <p className="text-gray-600">
            {t('signup.description')}
          </p>
        </div>

        <SignupForm />
      </div>
    </div>
  );
}

