'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { authService } from '@/lib/api/auth';
import { useTranslation } from '@/contexts/I18nContext';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError(t('auth.verifyEmail.tokenMissing'));
    } else {
      setToken(tokenParam);
      // Auto-verify when token is found
      handleVerify(tokenParam);
    }
  }, [searchParams, t]);

  const handleVerify = async (verifyToken: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.verifyEmail(verifyToken);
      setIsSuccess(true);
      setVerifiedEmail(result.user.email);
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push('/login?verified=success');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.verifyEmail.error.message'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="text-center space-y-5">
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                  {error || t('auth.verifyEmail.tokenMissingMessage')}
                </div>
                <p className="text-sm text-gray-600">
                  {t('auth.verifyEmail.tokenMissingHint')}
                </p>
                <Link href="/login">
                  <Button className="w-full bg-primary hover:bg-viridial-700 text-white border-0">
                    {t('auth.verifyEmail.backToLogin')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {t('auth.verifyEmail.title')}
            </h1>
            <p className="text-sm text-gray-600">
              {t('auth.verifyEmail.description')}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            {isSuccess ? (
              <div className="text-center space-y-5">
                <div className="rounded-md bg-viridial-50 p-4 text-sm text-viridial-700 border border-viridial-200">
                  <p className="font-medium mb-2">✅ {t('auth.verifyEmail.success.title')}</p>
                  {verifiedEmail && (
                    <p className="text-xs text-gray-600 mb-2">
                      {verifiedEmail}
                    </p>
                  )}
                  <p>{t('auth.verifyEmail.success.message')}</p>
                  <p className="mt-2 text-xs text-gray-600">{t('auth.verifyEmail.success.redirect')}</p>
                </div>
                <Link href="/login">
                  <Button className="w-full bg-primary hover:bg-viridial-700 text-white border-0">
                    {t('auth.verifyEmail.success.loginNow')}
                  </Button>
                </Link>
              </div>
            ) : error ? (
              <div className="text-center space-y-5">
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                  <p className="font-medium mb-2">❌ {t('auth.verifyEmail.error.title')}</p>
                  <p>{error}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    {t('auth.verifyEmail.error.message')}
                  </p>
                  <Link href="/login">
                    <Button className="w-full bg-primary hover:bg-viridial-700 text-white border-0">
                      {t('auth.verifyEmail.backToLogin')}
                    </Button>
                  </Link>
                  <Link 
                    href="/forgot-password" 
                    className="block text-sm text-primary hover:text-viridial-700 hover:underline font-medium"
                  >
                    {t('auth.verifyEmail.error.helpLink')}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-primary"></div>
                </div>
                <p className="text-sm text-gray-600">
                  {t('auth.verifyEmail.verifying')}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function LoadingFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-primary mb-3"></div>
          <div className="text-sm text-gray-600">{t('auth.verifyEmail.loading')}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailForm />
    </Suspense>
  );
}

