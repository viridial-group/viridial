'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function RolesPage() {
  const { toast } = useToast();

  // TODO: Fetch from API
  const roles = [
    {
      id: '1',
      name: 'Administrateur',
      description: 'Accès complet à toutes les fonctionnalités',
      permissions: [
        'organizations:create',
        'organizations:read',
        'organizations:update',
        'organizations:delete',
        'users:create',
        'users:read',
        'users:update',
        'users:delete',
        'roles:manage',
      ],
    },
    {
      id: '2',
      name: 'Manager',
      description: 'Gestion des utilisateurs et des propriétés',
      permissions: [
        'organizations:read',
        'users:create',
        'users:read',
        'users:update',
        'properties:manage',
      ],
    },
    {
      id: '3',
      name: 'Utilisateur',
      description: 'Accès de base aux fonctionnalités',
      permissions: [
        'properties:read',
        'properties:create',
        'properties:update',
      ],
    },
  ];

  const permissionGroups = {
    'Organisations': [
      { key: 'organizations:create', label: 'Créer' },
      { key: 'organizations:read', label: 'Lire' },
      { key: 'organizations:update', label: 'Modifier' },
      { key: 'organizations:delete', label: 'Supprimer' },
    ],
    'Utilisateurs': [
      { key: 'users:create', label: 'Créer' },
      { key: 'users:read', label: 'Lire' },
      { key: 'users:update', label: 'Modifier' },
      { key: 'users:delete', label: 'Supprimer' },
    ],
    'Propriétés': [
      { key: 'properties:create', label: 'Créer' },
      { key: 'properties:read', label: 'Lire' },
      { key: 'properties:update', label: 'Modifier' },
      { key: 'properties:delete', label: 'Supprimer' },
    ],
    'Rôles': [
      { key: 'roles:manage', label: 'Gérer' },
    ],
  };

  const hasPermission = (rolePermissions: string[], permission: string) => {
    return rolePermissions.includes(permission);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-8 w-8 text-viridial-600" />
              Rôles & Permissions
            </h1>
            <p className="text-gray-600 mt-2">
              Configurez les rôles et leurs permissions
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-viridial-600 to-viridial-700 hover:from-viridial-700 hover:to-viridial-800"
            onClick={() => toast({
              title: 'Fonctionnalité à venir',
              description: 'La création de rôles personnalisés sera disponible prochainement.',
              variant: 'warning',
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau rôle
          </Button>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card key={role.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl">{role.name}</CardTitle>
                  <div className="w-12 h-12 bg-viridial-100 rounded-lg flex items-center justify-center">
                    <Lock className="h-6 w-6 text-viridial-600" />
                  </div>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(permissionGroups).map(([groupName, permissions]) => (
                    <div key={groupName}>
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        {groupName}
                      </div>
                      <div className="space-y-1">
                        {permissions.map((permission) => {
                          const hasPerm = hasPermission(role.permissions, permission.key);
                          return (
                            <div
                              key={permission.key}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-600">{permission.label}</span>
                              {hasPerm ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-300" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Badge variant="outline" className="w-full justify-center">
                    {role.permissions.length} permission(s)
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              À propos des rôles et permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              Les rôles définissent les permissions d'accès des utilisateurs. Chaque rôle peut avoir 
              différentes permissions pour différentes ressources (organisations, utilisateurs, propriétés, etc.). 
              Les permissions suivent le format <code className="bg-white px-1 py-0.5 rounded">ressource:action</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

