'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email',
    emailTemplateId: '',
    segmentId: '',
    subject: '',
    fromName: '',
    fromEmail: '',
    replyTo: '',
    scheduledAt: null as Date | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Appel API réel
      // const response = await fetch('/api/marketing/campaigns', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // Mock pour l'instant
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push('/marketing/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nouvelle Campagne</h1>
        <p className="text-muted-foreground mt-1">
          Créez une nouvelle campagne email marketing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Configurez les détails de base de votre campagne
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la campagne *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Email de bienvenue - Janvier 2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la campagne..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de campagne</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="multi_channel">Multi-canal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template Email</CardTitle>
            <CardDescription>
              Sélectionnez le template email à utiliser
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailTemplate">Template *</Label>
              <Select
                value={formData.emailTemplateId}
                onValueChange={(value) => setFormData({ ...formData, emailTemplateId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Email de bienvenue</SelectItem>
                  <SelectItem value="nurturing">Email de nurturing</SelectItem>
                  <SelectItem value="promotional">Email promotionnel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Sujet de l'email *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Ex: Bienvenue sur Viridial ! 🎉"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expéditeur</CardTitle>
            <CardDescription>
              Configurez les informations de l'expéditeur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromName">Nom de l'expéditeur</Label>
                <Input
                  id="fromName"
                  value={formData.fromName}
                  onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                  placeholder="Viridial"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromEmail">Email de l'expéditeur</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={formData.fromEmail}
                  onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                  placeholder="noreply@viridial.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="replyTo">Répondre à</Label>
              <Input
                id="replyTo"
                type="email"
                value={formData.replyTo}
                onChange={(e) => setFormData({ ...formData, replyTo: e.target.value })}
                placeholder="support@viridial.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audience</CardTitle>
            <CardDescription>
              Sélectionnez le segment de leads à cibler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="segment">Segment</Label>
              <Select
                value={formData.segmentId}
                onValueChange={(value) => setFormData({ ...formData, segmentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les leads</SelectItem>
                  <SelectItem value="new">Nouveaux leads</SelectItem>
                  <SelectItem value="qualified">Leads qualifiés</SelectItem>
                  <SelectItem value="engaged">Leads engagés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Planification</CardTitle>
            <CardDescription>
              Planifiez l'envoi de votre campagne (optionnel)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Date d'envoi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduledAt
                      ? format(formData.scheduledAt, 'PPP', { locale: fr })
                      : 'Sélectionner une date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.scheduledAt || undefined}
                    onSelect={(date) => setFormData({ ...formData, scheduledAt: date || null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Créer la campagne'}
          </Button>
        </div>
      </form>
    </div>
  );
}

