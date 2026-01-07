'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { authService } from '@/lib/api/auth';

export default function ResetPasswordPage() {
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
      <div className="flex min-h-screen flex-col bg-[var(--color-neutral-200)]">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="bg-[var(--color-neutral-100)] border border-[var(--color-neutral-400)] rounded-[var(--radius)] shadow-[0_4px_12px_rgba(11,18,32,0.04)] p-6">
              <div className="text-center space-y-4">
                <div className="rounded-md bg-[var(--color-danger)]/15 p-4 text-sm text-[var(--color-danger)] border border-[var(--color-danger)]/20">
                  {error || 'Token de réinitialisation manquant'}
                </div>
                <Link href="/forgot-password">
                  <Button variant="accent" className="w-full">
                    Demander un nouveau lien
                  </Button>
                </Link>
                <Link href="/login" className="block text-sm text-[var(--color-accent)] hover:underline">
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
    <div className="flex min-h-screen flex-col bg-[var(--color-neutral-200)]">
      <Header />
      
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-[var(--color-primary)] mb-2">
              Réinitialiser votre mot de passe
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Entrez votre nouveau mot de passe ci-dessous
            </p>
          </div>

          <div className="bg-[var(--color-neutral-100)] border border-[var(--color-neutral-400)] rounded-[var(--radius)] shadow-[0_4px_12px_rgba(11,18,32,0.04)] p-6">
            {isSuccess ? (
              <div className="text-center space-y-4">
                <div className="rounded-md bg-[var(--color-success)]/15 p-4 text-sm text-[var(--color-success)] border border-[var(--color-success)]/20">
                  <p className="font-medium mb-2">✅ Mot de passe réinitialisé !</p>
                  <p>Votre mot de passe a été modifié avec succès.</p>
                  <p className="mt-2 text-xs">Redirection vers la page de connexion...</p>
                </div>
                <Link href="/login">
                  <Button variant="accent" className="w-full">
                    Se connecter maintenant
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="mb-4 rounded-md bg-[var(--color-danger)]/15 p-3 text-sm text-[var(--color-danger)] border border-[var(--color-danger)]/20">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-[var(--color-primary)] text-sm font-medium">
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
                  {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-[var(--color-accent)] hover:underline"
                  >
                    Retour à la connexion
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

