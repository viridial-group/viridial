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

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const success = searchParams.get('success');
    const emailParam = searchParams.get('email');
    if (success === 'true' && emailParam) {
      toast({
        variant: 'success',
        title: t('auth.signup.toasts.success.title'),
        description: t('auth.signup.toasts.success.description', { email: emailParam }),
      });
    }
  }, [searchParams, toast]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(t('auth.signup.validation.emailRequired'));
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return t('auth.signup.validation.passwordMin');
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return t('auth.signup.validation.passwordLowercase');
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return t('auth.signup.validation.passwordUppercase');
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return t('auth.signup.validation.passwordDigit');
    }
    return null;
  };

  const validateConfirmPassword = (pwd: string, confirm: string): boolean => {
    if (pwd !== confirm) {
      setConfirmPasswordError(t('auth.signup.validation.confirmPasswordMatch'));
      return false;
    }
    setConfirmPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    // Validation côté client
    const isEmailValid = validateEmail(email);
    const passwordErrorMsg = validatePassword(password);
    if (passwordErrorMsg) {
      setPasswordError(passwordErrorMsg);
      return;
    }
    const isConfirmValid = validateConfirmPassword(password, confirmPassword);

    if (!isEmailValid || !isConfirmValid) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.signup(email, password, confirmPassword);
      // Afficher un message de succès avec instruction de vérifier l'email
      if (result.message) {
        // Rediriger vers une page de confirmation ou afficher un message
        router.push(`/signup?success=true&email=${encodeURIComponent(email)}`);
      } else {
        toast({
          variant: 'success',
          title: t('auth.signup.toasts.redirect.title'),
          description: t('auth.signup.toasts.redirect.description'),
        });
        router.push('/login?signup=success');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.signup.toasts.error.description');
      toast({
        variant: 'error',
        title: t('auth.signup.toasts.error.title'),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {t('auth.signup.title')}
            </h1>
            <p className="text-sm text-gray-600">
              {t('auth.signup.subtitle')}{' '}
              <Link
                href="/login"
                className="text-primary hover:text-viridial-700 hover:underline font-medium"
              >
                {t('auth.signup.login')}
              </Link>
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-700">
                  {t('auth.signup.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.signup.emailPlaceholder')}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  onBlur={() => validateEmail(email)}
                  required
                  disabled={isLoading}
                  className={`h-11 ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {emailError && (
                  <p className="text-xs text-red-600 mt-1">{emailError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-gray-700">
                  {t('auth.signup.password')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.signup.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) {
                      const error = validatePassword(e.target.value);
                      setPasswordError(error);
                    }
                  }}
                  onBlur={() => {
                    const error = validatePassword(password);
                    setPasswordError(error);
                  }}
                  required
                  disabled={isLoading}
                  className={`h-11 ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {passwordError ? (
                  <p className="text-xs text-red-600 mt-1">{passwordError}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    {t('auth.signup.passwordHint')}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  {t('auth.signup.confirmPassword')}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmPasswordError) {
                      validateConfirmPassword(password, e.target.value);
                    }
                  }}
                  onBlur={() => validateConfirmPassword(password, confirmPassword)}
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
                {isLoading ? t('auth.signup.submitLoading') : t('auth.signup.submit')}
              </Button>
            </form>

            <p className="mt-6 text-xs text-center text-gray-500">
              {t('auth.signup.terms')}{' '}
              <Link href="/terms" className="text-primary hover:text-viridial-700 hover:underline font-medium">
                {t('auth.signup.termsLink')}
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SignupPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-primary mb-3"></div>
            <div className="text-sm text-gray-600">{t('auth.signup.loading')}</div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}

