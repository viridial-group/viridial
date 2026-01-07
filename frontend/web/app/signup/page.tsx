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
    <div className="flex min-h-screen flex-col bg-[var(--color-neutral-200)]">
      <Header />
      
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-[var(--color-primary)] mb-2">
              Créer un compte
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Vous avez déjà un compte ?{' '}
              <Link
                href="/login"
                className="text-[var(--color-accent)] hover:underline font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>

          <div className="bg-[var(--color-neutral-100)] border border-[var(--color-neutral-400)] rounded-[var(--radius)] shadow-[0_4px_12px_rgba(11,18,32,0.04)] p-6">
            {showSuccessMessage && successEmail ? (
              <div className="text-center space-y-4">
                <div className="rounded-md bg-[var(--color-success)]/15 p-4 text-sm text-[var(--color-success)] border border-[var(--color-success)]/20">
                  <p className="font-medium mb-2">✅ Inscription réussie !</p>
                  <p className="mb-2">
                    Un email de vérification a été envoyé à <strong>{successEmail}</strong>
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    Veuillez cliquer sur le lien dans l'email pour activer votre compte.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-[var(--color-muted)]">
                    Vous n'avez pas reçu l'email ?
                  </p>
                  <Link href="/login">
                    <Button variant="accent" className="w-full">
                      Aller à la connexion
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 rounded-md bg-[var(--color-danger)]/15 p-3 text-sm text-[var(--color-danger)] border border-[var(--color-danger)]/20">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[var(--color-primary)] text-sm font-medium">
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
                  className="h-11 border-[var(--color-neutral-400)] rounded-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[var(--color-primary)] text-sm font-medium">
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
                  className="h-11 border-[var(--color-neutral-400)] rounded-md"
                />
                <p className="text-xs text-[var(--color-muted)]">
                  Au moins 8 caractères, une majuscule, une minuscule et un chiffre
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[var(--color-primary)] text-sm font-medium">
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
                  className="h-11 border-[var(--color-neutral-400)] rounded-md"
                />
              </div>

              <Button
                type="submit"
                variant="accent"
                className="w-full h-11 rounded-md"
                disabled={isLoading}
              >
                {isLoading ? 'Création...' : 'Créer un compte'}
              </Button>
            </form>

            <p className="mt-6 text-xs text-center text-[var(--color-muted)]">
              En créant un compte, vous acceptez nos{' '}
              <Link href="/terms" className="text-[var(--color-accent)] hover:underline">
                Conditions d'utilisation
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
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-[var(--color-neutral-200)]">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">Chargement...</div>
        </main>
        <Footer />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}

