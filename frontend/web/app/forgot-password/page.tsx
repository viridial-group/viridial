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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Mot de passe oublié ?
            </h1>
            <p className="text-sm text-gray-600">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            {isSubmitted ? (
              <div className="text-center space-y-5">
                <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 border border-green-200">
                  <p className="font-medium mb-2">✅ Email envoyé !</p>
                  <p>
                    Si cet email est enregistré, un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
                  </p>
                  <p className="mt-2 text-xs text-gray-600">
                    Vérifiez votre boîte de réception et vos spams. Le lien expirera dans 1 heure.
                  </p>
                </div>
                <Link href="/login">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white border-0">
                    Retour à la connexion
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

                <Button
                  type="submit"
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white border-0"
                  disabled={isLoading}
                >
                  {isLoading ? 'Envoi...' : 'Envoyer le lien'}
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

