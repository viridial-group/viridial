'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { authService } from '@/lib/api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
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
              Mot de passe oublié ?
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          <div className="bg-[var(--color-neutral-100)] border border-[var(--color-neutral-400)] rounded-[var(--radius)] shadow-[0_4px_12px_rgba(11,18,32,0.04)] p-6">
            {isSubmitted ? (
              <div className="text-center space-y-4">
                <div className="rounded-md bg-[var(--color-success)]/15 p-4 text-sm text-[var(--color-success)] border border-[var(--color-success)]/20">
                  <p className="font-medium mb-2">✅ Email envoyé !</p>
                  <p>
                    Si cet email est enregistré, un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
                  </p>
                  <p className="mt-2 text-xs">
                    Vérifiez votre boîte de réception et vos spams. Le lien expirera dans 1 heure.
                  </p>
                </div>
                <Link href="/login">
                  <Button variant="accent" className="w-full">
                    Retour à la connexion
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

                <Button
                  type="submit"
                  variant="accent"
                  className="w-full h-11 rounded-md"
                  disabled={isLoading}
                >
                  {isLoading ? 'Envoi...' : 'Envoyer le lien'}
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

