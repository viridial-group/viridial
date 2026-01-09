'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Eye, MousePointerClick, Send, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Campaign {
  id: string;
  name: string;
  status: string;
  type: string;
  totalRecipients: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      // TODO: Appel API réel
      // const response = await fetch('/api/marketing/campaigns');
      // const data = await response.json();
      
      // Mock data
      setTimeout(() => {
        setCampaigns([
          {
            id: '1',
            name: 'Email de bienvenue - Nouveaux leads',
            status: 'sent',
            type: 'email',
            totalRecipients: 150,
            sentCount: 150,
            openedCount: 45,
            clickedCount: 12,
            sentAt: '2025-01-10T10:00:00Z',
            createdAt: '2025-01-10T09:00:00Z',
          },
          {
            id: '2',
            name: 'Promotion Q1 2025',
            status: 'scheduled',
            type: 'email',
            totalRecipients: 500,
            sentCount: 0,
            openedCount: 0,
            clickedCount: 0,
            scheduledAt: '2025-01-15T09:00:00Z',
            createdAt: '2025-01-12T14:00:00Z',
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      scheduled: 'secondary',
      sending: 'default',
      sent: 'default',
      paused: 'secondary',
      cancelled: 'destructive',
    };

    const labels: Record<string, string> = {
      draft: 'Brouillon',
      scheduled: 'Planifiée',
      sending: 'Envoi...',
      sent: 'Envoyée',
      paused: 'En pause',
      cancelled: 'Annulée',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const calculateOpenRate = (campaign: Campaign) => {
    if (campaign.sentCount === 0) return 0;
    return ((campaign.openedCount / campaign.sentCount) * 100).toFixed(1);
  };

  const calculateClickRate = (campaign: Campaign) => {
    if (campaign.sentCount === 0) return 0;
    return ((campaign.clickedCount / campaign.sentCount) * 100).toFixed(1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campagnes</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos campagnes email marketing
          </p>
        </div>
        <Button asChild>
          <Link href="/marketing/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Campagne
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement des campagnes...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune campagne</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre première campagne pour commencer
            </p>
            <Button asChild>
              <Link href="/marketing/campaigns/new">Créer une campagne</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{campaign.name}</CardTitle>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <CardDescription>
                      {campaign.scheduledAt
                        ? `Planifiée le ${new Date(campaign.scheduledAt).toLocaleDateString('fr-FR')}`
                        : campaign.sentAt
                        ? `Envoyée le ${new Date(campaign.sentAt).toLocaleDateString('fr-FR')}`
                        : `Créée le ${new Date(campaign.createdAt).toLocaleDateString('fr-FR')}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/marketing/campaigns/${campaign.id}`}>
                        Voir détails
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Send className="h-4 w-4" />
                      Envoyés
                    </div>
                    <div className="text-2xl font-bold">
                      {campaign.sentCount}/{campaign.totalRecipients}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      Ouvertures
                    </div>
                    <div className="text-2xl font-bold">{campaign.openedCount}</div>
                    <div className="text-xs text-muted-foreground">
                      {calculateOpenRate(campaign)}% taux
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MousePointerClick className="h-4 w-4" />
                      Clics
                    </div>
                    <div className="text-2xl font-bold">{campaign.clickedCount}</div>
                    <div className="text-xs text-muted-foreground">
                      {calculateClickRate(campaign)}% taux
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Date
                    </div>
                    <div className="text-sm font-medium">
                      {campaign.sentAt
                        ? new Date(campaign.sentAt).toLocaleDateString('fr-FR')
                        : campaign.scheduledAt
                        ? new Date(campaign.scheduledAt).toLocaleDateString('fr-FR')
                        : '-'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

