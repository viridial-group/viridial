'use client';

import { useState, useEffect } from 'react';
import { Settings, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Composant pour activer/désactiver le mode mock
 * Visible uniquement en développement
 */
export function MockModeToggle() {
  const [mockEnabled, setMockEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Vérifier l'état actuel
    const isEnabled =
      process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true' ||
      localStorage.getItem('mockAuth') === 'true';
    setMockEnabled(isEnabled);
  }, []);

  const toggleMock = () => {
    const newState = !mockEnabled;
    localStorage.setItem('mockAuth', String(newState));
    setMockEnabled(newState);
    
    // Recharger la page pour appliquer les changements
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  if (!mounted) return null;

  // Ne montrer qu'en développement
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Mode Mock
          </CardTitle>
          <Badge variant={mockEnabled ? 'default' : 'secondary'} className="text-xs">
            {mockEnabled ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Actif
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Inactif
              </>
            )}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Utiliser des données mockées pour tester l&apos;interface sans backend
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <Button
            onClick={toggleMock}
            variant={mockEnabled ? 'destructive' : 'default'}
            size="sm"
            className="w-full"
          >
            {mockEnabled ? 'Désactiver Mock' : 'Activer Mock'}
          </Button>
          {mockEnabled && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold">Comptes de test :</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>admin@viridial.com / admin123</li>
                <li>owner@example.com / owner123</li>
                <li>agent@example.com / agent123</li>
                <li>user@example.com / user123</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

