'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { authService } from '@/lib/api/auth';
import { useToast } from '@/components/ui/simple-toast';
import { useTranslation } from '@/contexts/I18nContext';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(t('auth.forgotPassword.validation.emailRequired'));
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      toast({
        variant: 'success',
        title: t('auth.forgotPassword.toasts.success.title'),
        description: t('auth.forgotPassword.toasts.success.description'),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.forgotPassword.toasts.error.description');
      toast({
        variant: 'error',
        title: t('auth.forgotPassword.toasts.error.title'),
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
              {t('auth.forgotPassword.title')}
            </h1>
            <p className="text-sm text-gray-600">
              {t('auth.forgotPassword.description')}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            {isSubmitted ? (
              <div className="text-center space-y-5">
                <div className="rounded-md bg-viridial-50 p-4 text-sm text-viridial-700 border border-viridial-200">
                  <p className="font-medium mb-2">✅ {t('auth.forgotPassword.submitted.title')}</p>
                  <p>
                    {t('auth.forgotPassword.submitted.message', { email })}
                  </p>
                  <p className="mt-2 text-xs text-gray-600">
                    {t('auth.forgotPassword.submitted.hint')}
                  </p>
                </div>
                <Link href="/login">
                  <Button className="w-full bg-primary hover:bg-viridial-700 text-white border-0">
                    {t('auth.forgotPassword.backToLogin')}
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-gray-700">
                    {t('auth.forgotPassword.email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
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

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-viridial-700 text-white border-0"
                  disabled={isLoading}
                >
                  {isLoading ? t('auth.forgotPassword.submitLoading') : t('auth.forgotPassword.submit')}
                </Button>

                <div className="text-center pt-3 border-t border-gray-200">
                  <Link
                    href="/login"
                    className="text-sm text-gray-500 hover:text-gray-700 hover:underline font-medium"
                  >
                    ← {t('auth.forgotPassword.backToLogin')}
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

