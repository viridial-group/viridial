'use client';

import { Badge } from './badge';
import { AlertCircle } from 'lucide-react';

/**
 * Visual indicator that mock/test data mode is active
 */
export function MockIndicator() {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-pulse">
      <Badge 
        variant="outline" 
        className="bg-yellow-50 text-yellow-700 border-yellow-300 shadow-lg flex items-center gap-2 px-3 py-1.5"
        title="Mode test actif - Données mockées pour le développement local"
      >
        <AlertCircle className="h-3.5 w-3.5" />
        <span className="text-xs font-semibold">🧪 MOCK MODE</span>
      </Badge>
    </div>
  );
}

