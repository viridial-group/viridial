'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // TODO: Implémenter l'inscription
    setTimeout(() => {
      setIsLoading(false);
      router.push('/login');
    }, 1000);
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

