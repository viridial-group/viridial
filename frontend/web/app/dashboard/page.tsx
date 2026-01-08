'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <p className="text-[var(--color-muted)] mb-4">
                Gérez vos propriétés immobilières depuis votre tableau de bord.
              </p>
              <Link href="/properties">
                <Button className="w-full">Mes Propriétés</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-neutral-100)]">
            <CardHeader>
              <CardTitle className="text-[var(--color-primary)]">
                Actions rapides
              </CardTitle>
              <CardDescription className="text-[var(--color-muted)]">
                Accès rapide aux fonctionnalités
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/properties/new">
                <Button variant="outline" className="w-full">+ Nouvelle Propriété</Button>
              </Link>
              <Link href="/properties">
                <Button variant="outline" className="w-full">Voir toutes mes propriétés</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

