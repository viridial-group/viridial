'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export default function KeyboardShortcuts({ shortcuts, enabled = true }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      // Check for modifier keys
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // Find matching shortcut
      const shortcut = shortcuts.find((s) => {
        const parts = s.key.split('+').map((p) => p.trim().toLowerCase());
        const keyPart = parts[parts.length - 1];
        const modifiers = parts.slice(0, -1);

        const keyMatches = keyPart === e.key.toLowerCase() || keyPart === e.code.toLowerCase();
        const ctrlMatches = modifiers.includes('ctrl') || modifiers.includes('cmd') ? isCtrl : !isCtrl;
        const shiftMatches = modifiers.includes('shift') ? isShift : !isShift;
        const altMatches = modifiers.includes('alt') ? isAlt : !isAlt;

        return keyMatches && ctrlMatches && shiftMatches && altMatches;
      });

      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }

      // Show/hide help with Ctrl/Cmd + /
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowHelp(!showHelp);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled, showHelp]);

  if (!showHelp) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 right-4 z-40 shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200"
        title="Raccourcis clavier (Ctrl/Cmd + /)"
      >
        <Keyboard className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Raccourcis clavier
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <span className="text-gray-700">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.key.split('+').map((key, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="font-mono text-xs px-2 py-1"
                  >
                    {key.trim() === 'cmd' ? '⌘' : key.trim() === 'ctrl' ? 'Ctrl' : key.trim() === 'shift' ? '⇧' : key.trim() === 'alt' ? '⌥' : key.trim().toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-3 text-sm text-gray-500 text-center">
          Appuyez sur <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">/</kbd> pour fermer
        </div>
      </div>
    </div>
  );
}

