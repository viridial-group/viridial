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
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="text-center space-y-5">
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                  {error || 'Token de vérification manquant'}
                </div>
                <p className="text-sm text-gray-600">
                  Veuillez utiliser le lien de vérification reçu par email.
                </p>
                <Link href="/login">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white border-0">
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Vérification de votre email
            </h1>
            <p className="text-sm text-gray-600">
              Veuillez patienter pendant la vérification...
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            {isSuccess ? (
              <div className="text-center space-y-5">
                <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 border border-green-200">
                  <p className="font-medium mb-2">✅ Email vérifié avec succès !</p>
                  {verifiedEmail && (
                    <p className="text-xs text-gray-600 mb-2">
                      {verifiedEmail}
                    </p>
                  )}
                  <p>Votre adresse email a été vérifiée. Vous pouvez maintenant vous connecter.</p>
                  <p className="mt-2 text-xs text-gray-600">Redirection vers la page de connexion...</p>
                </div>
                <Link href="/login">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white border-0">
                    Se connecter maintenant
                  </Button>
                </Link>
              </div>
            ) : error ? (
              <div className="text-center space-y-5">
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                  <p className="font-medium mb-2">❌ Erreur de vérification</p>
                  <p>{error}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Le lien a peut-être expiré ou a déjà été utilisé.
                  </p>
                  <Link href="/login">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white border-0">
                      Retour à la connexion
                    </Button>
                  </Link>
                  <Link 
                    href="/forgot-password" 
                    className="block text-sm text-green-600 hover:text-green-700 hover:underline font-medium"
                  >
                    Besoin d'aide ?
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-green-600"></div>
                </div>
                <p className="text-sm text-gray-600">
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
      <VerifyEmailForm />
    </Suspense>
  );
}

