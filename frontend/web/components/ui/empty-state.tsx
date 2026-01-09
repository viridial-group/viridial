'use client';

import { Button } from './button';
import { Card, CardContent } from './card';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className = '',
}: EmptyStateProps) {
  const content = (
    <Card className={`border border-gray-200 bg-white ${className}`}>
      <CardContent className="pt-12 pb-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200 fade-in">
          <Icon className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
        {actionLabel && (onAction || actionHref) && (
          <div className="flex justify-center">
            {actionHref ? (
              <a href={actionHref}>
                <Button className="bg-primary hover:bg-viridial-700 text-white border-0 btn-press scale-on-hover">
                  {actionLabel}
                </Button>
              </a>
            ) : (
              <Button 
                onClick={onAction}
                className="bg-primary hover:bg-viridial-700 text-white border-0 btn-press scale-on-hover"
              >
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return content;
}

