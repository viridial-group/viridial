'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { authService } from '@/lib/api/auth';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Token de vérification manquant. Veuillez utiliser le lien reçu par email.');
    } else {
      setToken(tokenParam);
      // Auto-verify when token is found
      handleVerify(tokenParam);
    }
  }, [searchParams]);

  const handleVerify = async (verifyToken: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.verifyEmail(verifyToken);
      setIsSuccess(true);
      setVerifiedEmail(result.user.email);
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push('/login?verified=success');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la vérification');
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
                  {error || 'Token de vérification manquant'}
                </div>
                <p className="text-sm text-[var(--color-muted)]">
                  Veuillez utiliser le lien de vérification reçu par email.
                </p>
                <Link href="/login">
                  <Button variant="accent" className="w-full">
                    Retour à la connexion
                  </Button>
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
              Vérification de votre email
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Veuillez patienter pendant la vérification...
            </p>
          </div>

          <div className="bg-[var(--color-neutral-100)] border border-[var(--color-neutral-400)] rounded-[var(--radius)] shadow-[0_4px_12px_rgba(11,18,32,0.04)] p-6">
            {isSuccess ? (
              <div className="text-center space-y-4">
                <div className="rounded-md bg-[var(--color-success)]/15 p-4 text-sm text-[var(--color-success)] border border-[var(--color-success)]/20">
                  <p className="font-medium mb-2">✅ Email vérifié avec succès !</p>
                  {verifiedEmail && (
                    <p className="text-xs text-[var(--color-muted)] mb-2">
                      {verifiedEmail}
                    </p>
                  )}
                  <p>Votre adresse email a été vérifiée. Vous pouvez maintenant vous connecter.</p>
                  <p className="mt-2 text-xs">Redirection vers la page de connexion...</p>
                </div>
                <Link href="/login">
                  <Button variant="accent" className="w-full">
                    Se connecter maintenant
                  </Button>
                </Link>
              </div>
            ) : error ? (
              <div className="text-center space-y-4">
                <div className="rounded-md bg-[var(--color-danger)]/15 p-4 text-sm text-[var(--color-danger)] border border-[var(--color-danger)]/20">
                  <p className="font-medium mb-2">❌ Erreur de vérification</p>
                  <p>{error}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-[var(--color-muted)]">
                    Le lien a peut-être expiré ou a déjà été utilisé.
                  </p>
                  <Link href="/login">
                    <Button variant="accent" className="w-full">
                      Retour à la connexion
                    </Button>
                  </Link>
                  <Link 
                    href="/forgot-password" 
                    className="block text-sm text-[var(--color-accent)] hover:underline"
                  >
                    Besoin d'aide ?
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent)]"></div>
                </div>
                <p className="text-sm text-[var(--color-muted)]">
                  Vérification en cours...
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function VerifyEmailPage() {
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
      <VerifyEmailForm />
    </Suspense>
  );
}

