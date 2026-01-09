'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, User, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8 text-viridial-600" />
            Paramètres
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos préférences et configurations
          </p>
        </div>

        {/* Settings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-viridial-100 rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-viridial-600" />
                </div>
                <div>
                  <CardTitle>Profil utilisateur</CardTitle>
                  <CardDescription>Gérer vos informations personnelles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Modifiez votre nom, email et autres informations de profil.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configurer les notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Gérez vos préférences de notification et alertes.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Sécurité</CardTitle>
                  <CardDescription>Paramètres de sécurité</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Modifiez votre mot de passe et gérez la sécurité de votre compte.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Fonctionnalités à venir</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              Les pages de paramètres détaillées seront disponibles prochainement. 
              Vous pourrez gérer votre profil, vos notifications et vos préférences de sécurité.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

