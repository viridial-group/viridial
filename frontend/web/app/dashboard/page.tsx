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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-primary mb-4"></div>
          <div className="text-sm font-medium text-gray-700">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main id="main-content" className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Tableau de bord
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Gérez vos propriétés immobilières
            </p>
          </div>
          <Button variant="outline" onClick={logout} className="border-gray-300 hover:bg-gray-50">
            Déconnexion
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Bienvenue sur Viridial
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-1.5">
                Vous êtes connecté avec succès !
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                Gérez vos propriétés immobilières depuis votre tableau de bord.
              </p>
              <Link href="/properties">
                <Button className="w-full bg-primary hover:bg-viridial-700 text-white border-0">
                  Mes Propriétés
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Actions rapides
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-1.5">
                Accès rapide aux fonctionnalités
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <Link href="/properties/new">
                <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50">
                  + Nouvelle Propriété
                </Button>
              </Link>
              <Link href="/properties">
                <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50">
                  Voir toutes mes propriétés
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50">
                  Rechercher des propriétés
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

