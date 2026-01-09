'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Workflow, Play, Pause, Settings } from 'lucide-react';
import Link from 'next/link';

interface Workflow {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  trigger: string;
  stepsCount: number;
  createdAt: string;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  useEffect(() => {
    // TODO: Fetch workflows
    setWorkflows([
      {
        id: '1',
        name: 'Bienvenue nouveau lead',
        status: 'active',
        trigger: 'lead_created',
        stepsCount: 3,
        createdAt: '2025-01-10T10:00:00Z',
      },
    ]);
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      draft: 'outline',
      active: 'default',
      paused: 'secondary',
      archived: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status === 'active' ? 'Actif' : status === 'paused' ? 'En pause' : status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground mt-1">
            Automatisez vos actions marketing
          </p>
        </div>
        <Button asChild>
          <Link href="/marketing/workflows/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Workflow
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    {workflow.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Déclenché : {workflow.trigger} • {workflow.stepsCount} étapes
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(workflow.status)}
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Créé le {new Date(workflow.createdAt).toLocaleDateString('fr-FR')}
                </p>
                <div className="flex gap-2">
                  {workflow.status === 'active' ? (
                    <Button variant="outline" size="sm">
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Play className="mr-2 h-4 w-4" />
                      Activer
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/marketing/workflows/${workflow.id}`}>
                      Voir détails
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

