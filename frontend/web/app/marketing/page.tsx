'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mail,
  Users,
  TrendingUp,
  Calendar,
  Plus,
  BarChart3,
  Workflow,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalLeads: number;
  activeCampaigns: number;
  emailOpenRate: number;
  conversionRate: number;
  totalEmailsSent: number;
  activeWorkflows: number;
}

export default function MarketingDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    activeCampaigns: 0,
    emailOpenRate: 0,
    conversionRate: 0,
    totalEmailsSent: 0,
    activeWorkflows: 0,
  });

  useEffect(() => {
    // TODO: Récupérer les stats depuis l'API
    fetchMarketingStats();
  }, []);

  const fetchMarketingStats = async () => {
    try {
      // const response = await fetch('/api/marketing/analytics/stats');
      // const data = await response.json();
      // setStats(data);
      
      // Mock data pour l'instant
      setStats({
        totalLeads: 1247,
        activeCampaigns: 8,
        emailOpenRate: 24.5,
        conversionRate: 3.2,
        totalEmailsSent: 5432,
        activeWorkflows: 5,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketing Automation</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos campagnes, leads et workflows marketing
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/marketing/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Campagne
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/marketing/workflows/new">
              <Workflow className="mr-2 h-4 w-4" />
              Nouveau Workflow
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% depuis le mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campagnes Actives</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">{stats.totalEmailsSent} emails envoyés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'ouverture</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailOpenRate}%</div>
            <p className="text-xs text-muted-foreground">+2.1% vs moyenne</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">+0.5% depuis la semaine dernière</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campagnes récentes</CardTitle>
              <CardDescription>Vos campagnes email et leurs performances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* TODO: Liste des campagnes */}
                <div className="text-center text-muted-foreground py-8">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune campagne pour le moment</p>
                  <Button asChild className="mt-4">
                    <Link href="/marketing/campaigns/new">Créer votre première campagne</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leads</CardTitle>
              <CardDescription>Gérez vos leads et leur progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chargement des leads...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflows d'automatisation</CardTitle>
              <CardDescription>Automatisez vos actions marketing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun workflow configuré</p>
                <Button asChild className="mt-4">
                  <Link href="/marketing/workflows/new">Créer un workflow</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Analysez vos performances marketing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Graphiques et statistiques détaillées</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

