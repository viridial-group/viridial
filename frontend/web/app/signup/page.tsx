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

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get('success');
    const emailParam = searchParams.get('email');
    if (success === 'true' && emailParam) {
      setShowSuccessMessage(true);
      setSuccessEmail(emailParam);
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

    // Validation côté client
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
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
        router.push('/login?signup=success');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Créer un compte
            </h1>
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 hover:underline font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            {showSuccessMessage && successEmail ? (
              <div className="text-center space-y-5">
                <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 border border-green-200">
                  <p className="font-medium mb-2">✅ Inscription réussie !</p>
                  <p className="mb-2">
                    Un email de vérification a été envoyé à <strong>{successEmail}</strong>
                  </p>
                  <p className="text-xs text-gray-600">
                    Veuillez cliquer sur le lien dans l'email pour activer votre compte.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">
                    Vous n'avez pas reçu l'email ?
                  </p>
                  <Link href="/login">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white border-0">
                      Aller à la connexion
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-5 rounded-md bg-red-50 p-3.5 text-sm text-red-700 border border-red-200">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-gray-700">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {isLoading ? 'Création...' : 'Créer un compte'}
              </Button>
            </form>

            <p className="mt-6 text-xs text-center text-gray-500">
              En créant un compte, vous acceptez nos{' '}
              <Link href="/terms" className="text-green-600 hover:text-green-700 hover:underline font-medium">
                Conditions d'utilisation
              </Link>
              .
            </p>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SignupPage() {
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
      <SignupForm />
    </Suspense>
  );
}

