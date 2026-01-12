'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthApiError } from '@/lib/auth-api';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  // Get redirect URL from query params
  const searchParamsObj = useSearchParams();
  const redirectTo = searchParamsObj?.get('redirect') || '/';

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = t('errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('errors.emailInvalid');
    }

    if (!password) {
      newErrors.password = t('errors.passwordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('errors.passwordMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login({ email, password });
      
      toast({
        title: t('success.login'),
        description: t('success.loginDescription'),
        variant: 'success',
      });

      // Redirect to the requested page or dashboard
      router.push(redirectTo);
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof AuthApiError) {
        if (error.statusCode === 401) {
          setErrors({
            general: t('errors.invalidCredentials'),
          });
        } else if (error.statusCode === 429) {
          setErrors({
            general: t('errors.tooManyAttempts'),
          });
        } else {
          setErrors({
            general: error.message || t('errors.loginFailed'),
          });
        }
      } else {
        setErrors({
          general: t('errors.loginFailed'),
        });
      }

      toast({
        title: t('errors.loginFailed'),
        description: errors.general || t('errors.loginFailedDescription'),
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-gray-200 bg-white">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-center text-gray-900">
          {t('title')}
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          {t('description')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 px-6">
          {errors.general && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {errors.general}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              disabled={isLoading}
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`bg-gray-50 border-gray-300 text-gray-900 focus:border-viridial-500 focus:ring-viridial-500 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-gray-700 font-medium">{t('password')}</Label>
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-sm text-viridial-600 hover:text-viridial-700 hover:underline transition-colors"
                disabled={isLoading}
              >
                {t('forgotPassword')}
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                disabled={isLoading}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`bg-gray-50 border-gray-300 text-gray-900 focus:border-viridial-500 focus:ring-viridial-500 pr-10 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-sm text-red-600">
                {errors.password}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 px-6 pb-6">
          <Button
            type="submit"
            className="w-full bg-viridial-600 hover:bg-viridial-700 text-white font-medium py-2.5 shadow-sm transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('loggingIn')}
              </>
            ) : (
              t('login')
            )}
          </Button>

          <div className="text-center text-sm text-gray-600">
            {t('noAccount')}{' '}
            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="text-viridial-600 hover:text-viridial-700 hover:underline font-medium transition-colors"
              disabled={isLoading}
            >
              {t('signUp')}
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

