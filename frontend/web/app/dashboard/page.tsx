'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-200)]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-[var(--color-primary)]">
            Tableau de bord
          </h1>
          <Button variant="outline" onClick={logout} className="rounded-md">
            Déconnexion
          </Button>
        </div>

        <Card className="bg-[var(--color-neutral-100)]">
          <CardHeader>
            <CardTitle className="text-[var(--color-primary)]">
              Bienvenue sur Viridial
            </CardTitle>
            <CardDescription className="text-[var(--color-muted)]">
              Vous êtes connecté avec succès !
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-muted)]">
              Cette page est protégée par authentification. Vous pouvez maintenant accéder aux fonctionnalités de la plateforme.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

