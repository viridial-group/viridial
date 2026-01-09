'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Users, Shield, TrendingUp } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { currentOrganization, organizations } = useOrganization();
  const { user } = useAuth();

  const stats = [
    {
      name: 'Organisations',
      value: organizations.length,
      icon: Building2,
      color: 'text-viridial-600',
      bgColor: 'bg-viridial-50',
    },
    {
      name: 'Utilisateurs actifs',
      value: '0', // TODO: Fetch from API
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Rôles configurés',
      value: '0', // TODO: Fetch from API
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Taux d\'adoption',
      value: '0%', // TODO: Calculate from API
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenue, {user?.firstName || user?.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.name} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.name}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Organization */}
        {currentOrganization && (
          <Card>
            <CardHeader>
              <CardTitle>Organisation actuelle</CardTitle>
              <CardDescription>
                Informations sur votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Nom</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {currentOrganization.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Slug</div>
                  <div className="text-lg font-mono text-gray-900">
                    {currentOrganization.slug}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Email</div>
                  <div className="text-lg text-gray-900">
                    {currentOrganization.contactEmail}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Plan</div>
                  <div className="text-lg text-gray-900">
                    {currentOrganization.subscriptionPlan || 'Non défini'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Statut</div>
                  <div className="text-lg text-gray-900">
                    {currentOrganization.subscriptionStatus}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Créée le</div>
                  <div className="text-lg text-gray-900">
                    {formatDate(currentOrganization.createdAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accès rapide aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/dashboard/organizations"
                className="p-4 border border-gray-200 rounded-lg hover:border-viridial-300 hover:bg-viridial-50 transition-all cursor-pointer"
              >
                <Building2 className="h-8 w-8 text-viridial-600 mb-2" />
                <div className="font-semibold text-gray-900">Gérer les organisations</div>
                <div className="text-sm text-gray-600 mt-1">
                  Créer et configurer des organisations
                </div>
              </a>
              <a
                href="/dashboard/users"
                className="p-4 border border-gray-200 rounded-lg hover:border-viridial-300 hover:bg-viridial-50 transition-all cursor-pointer"
              >
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <div className="font-semibold text-gray-900">Gérer les utilisateurs</div>
                <div className="text-sm text-gray-600 mt-1">
                  Ajouter et gérer les utilisateurs
                </div>
              </a>
              <a
                href="/dashboard/roles"
                className="p-4 border border-gray-200 rounded-lg hover:border-viridial-300 hover:bg-viridial-50 transition-all cursor-pointer"
              >
                <Shield className="h-8 w-8 text-purple-600 mb-2" />
                <div className="font-semibold text-gray-900">Rôles & Permissions</div>
                <div className="text-sm text-gray-600 mt-1">
                  Configurer les rôles et permissions
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

