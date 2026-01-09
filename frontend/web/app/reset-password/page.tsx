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

// Disable static generation for this page
export const dynamic = 'force-dynamic';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Token de réinitialisation manquant. Veuillez utiliser le lien reçu par email.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins une minuscule';
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Token de réinitialisation manquant');
      return;
    }

    // Validation côté client
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, newPassword, confirmPassword);
      setIsSuccess(true);
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="text-center space-y-5">
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                  {error || 'Token de réinitialisation manquant'}
                </div>
                <Link href="/forgot-password">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white border-0">
                    Demander un nouveau lien
                  </Button>
                </Link>
                <Link href="/login" className="block text-sm text-green-600 hover:text-green-700 hover:underline font-medium">
                  Retour à la connexion
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
      
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Réinitialiser votre mot de passe
            </h1>
            <p className="text-sm text-gray-600">
              Entrez votre nouveau mot de passe ci-dessous
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            {isSuccess ? (
              <div className="text-center space-y-5">
                <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 border border-green-200">
                  <p className="font-medium mb-2">✅ Mot de passe réinitialisé !</p>
                  <p>Votre mot de passe a été modifié avec succès.</p>
                  <p className="mt-2 text-xs text-gray-600">Redirection vers la page de connexion...</p>
                </div>
                <Link href="/login">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white border-0">
                    Se connecter maintenant
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="mb-5 rounded-md bg-red-50 p-3.5 text-sm text-red-700 border border-red-200">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-gray-700">
                    Nouveau mot de passe
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">
                    Au moins 8 caractères, une majuscule, une minuscule et un chiffre
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-gray-700">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white border-0"
                  disabled={isLoading}
                >
                  {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </Button>

                <div className="text-center pt-3 border-t border-gray-200">
                  <Link
                    href="/login"
                    className="text-sm text-gray-500 hover:text-gray-700 hover:underline font-medium"
                  >
                    ← Retour à la connexion
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-green-600 mb-3"></div>
            <div className="text-sm text-gray-600">Chargement...</div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

