'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { authService } from '@/lib/api/auth';
import { useToast } from '@/components/ui/simple-toast';
import { useTranslation } from '@/contexts/I18nContext';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setTokenError(t('auth.resetPassword.tokenMissing'));
    } else {
      setToken(tokenParam);
      setTokenError(null);
    }
  }, [searchParams, t]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      const error = t('auth.resetPassword.validation.passwordMin');
      setPasswordError(error);
      return error;
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      const error = t('auth.resetPassword.validation.passwordLowercase');
      setPasswordError(error);
      return error;
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      const error = t('auth.resetPassword.validation.passwordUppercase');
      setPasswordError(error);
      return error;
    }
    if (!/(?=.*\d)/.test(pwd)) {
      const error = t('auth.resetPassword.validation.passwordDigit');
      setPasswordError(error);
      return error;
    }
    setPasswordError(null);
    return null;
  };

  const validateConfirmPassword = (pwd: string, confirm: string): boolean => {
    if (pwd !== confirm) {
      setConfirmPasswordError(t('auth.resetPassword.validation.confirmPasswordMatch'));
      return false;
    }
    setConfirmPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setConfirmPasswordError(null);

    if (!token) {
      setTokenError(t('auth.resetPassword.tokenError'));
      toast({
        variant: 'error',
        title: t('auth.resetPassword.toasts.tokenMissing.title'),
        description: t('auth.resetPassword.toasts.tokenMissing.description'),
      });
      return;
    }

    // Validation côté client
    const passwordErrorMsg = validatePassword(newPassword);
    if (passwordErrorMsg) {
      setPasswordError(passwordErrorMsg);
      return;
    }

    if (!validateConfirmPassword(newPassword, confirmPassword)) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, newPassword, confirmPassword);
      setIsSuccess(true);
      toast({
        variant: 'success',
        title: t('auth.resetPassword.toasts.success.title'),
        description: t('auth.resetPassword.toasts.success.description'),
      });
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.resetPassword.toasts.error.description');
      toast({
        variant: 'error',
        title: t('auth.resetPassword.toasts.error.title'),
        description: errorMessage,
      });
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
                {tokenError && (
                  <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                    {tokenError}
                  </div>
                )}
                <Link href="/forgot-password">
                  <Button className="w-full bg-primary hover:bg-viridial-700 text-white border-0">
                    {t('auth.resetPassword.requestNewLink')}
                  </Button>
                </Link>
                <Link href="/login" className="block text-sm text-primary hover:text-viridial-700 hover:underline font-medium">
                  {t('auth.resetPassword.backToLogin')}
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
              {t('auth.resetPassword.title')}
            </h1>
            <p className="text-sm text-gray-600">
              {t('auth.resetPassword.description')}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            {isSuccess ? (
              <div className="text-center space-y-5">
                <div className="rounded-md bg-viridial-50 p-4 text-sm text-viridial-700 border border-viridial-200">
                  <p className="font-medium mb-2">✅ {t('auth.resetPassword.success.title')}</p>
                  <p>{t('auth.resetPassword.success.message')}</p>
                  <p className="mt-2 text-xs text-gray-600">{t('auth.resetPassword.success.redirect')}</p>
                </div>
                <Link href="/login">
                  <Button className="w-full bg-primary hover:bg-viridial-700 text-white border-0">
                    {t('auth.resetPassword.success.loginNow')}
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-gray-700">
                    {t('auth.resetPassword.password')}
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder={t('auth.resetPassword.passwordPlaceholder')}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                      if (confirmPasswordError && confirmPassword) {
                        validateConfirmPassword(e.target.value, confirmPassword);
                      }
                    }}
                    onBlur={() => validatePassword(newPassword)}
                    required
                    disabled={isLoading}
                    className={`h-11 ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {passwordError ? (
                    <p className="text-xs text-red-600 mt-1">{passwordError}</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      {t('auth.resetPassword.passwordHint')}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-gray-700">
                    {t('auth.resetPassword.confirmPassword')}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) setConfirmPasswordError(null);
                    }}
                    onBlur={() => validateConfirmPassword(newPassword, confirmPassword)}
                    required
                    disabled={isLoading}
                    className={`h-11 ${confirmPasswordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {confirmPasswordError && (
                    <p className="text-xs text-red-600 mt-1">{confirmPasswordError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-viridial-700 text-white border-0"
                  disabled={isLoading}
                >
                  {isLoading ? t('auth.resetPassword.submitLoading') : t('auth.resetPassword.submit')}
                </Button>

                <div className="text-center pt-3 border-t border-gray-200">
                  <Link
                    href="/login"
                    className="text-sm text-gray-500 hover:text-gray-700 hover:underline font-medium"
                  >
                    ← {t('auth.resetPassword.backToLogin')}
                  </Link>
                </div>
              </form>
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
          <div className="text-sm text-gray-600">{t('auth.resetPassword.loading')}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

