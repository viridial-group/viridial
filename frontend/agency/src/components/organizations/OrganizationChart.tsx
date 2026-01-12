'use client';

import React from 'react';
import { OrganizationTreeNode } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, CheckCircle2, XCircle, ExternalLink, MapPin } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface OrganizationChartProps {
  tree: OrganizationTreeNode;
  onOrganizationClick?: (organizationId: string) => void;
}

const planColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  basic: 'bg-blue-100 text-blue-700',
  professional: 'bg-purple-100 text-purple-700',
  enterprise: 'bg-viridial-100 text-viridial-700',
};

export function OrganizationChart({ tree, onOrganizationClick }: OrganizationChartProps) {
  const router = useRouter();
  const t = useTranslations('organizations');
  const tCommon = useTranslations('common');

  const handleCardClick = (organizationId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (onOrganizationClick) {
      onOrganizationClick(organizationId);
    } else {
      router.push(`/organizations/${organizationId}`);
    }
  };

  const renderNode = (node: OrganizationTreeNode): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const childrenCount = node.children?.length || 0;

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Carte de l'organisation */}
        <Card
          className={`
            w-72 cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-white relative z-10
            ${node.level === 0 ? 'border-2 border-viridial-500 shadow-md' : 'border border-gray-200'}
          `}
          onClick={(e) => handleCardClick(node.id, e)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg flex-shrink-0 ${node.level === 0 ? 'bg-viridial-100 border border-viridial-200' : 'bg-gray-100 border border-gray-200'}`}>
                  <Building2 className={`h-5 w-5 ${node.level === 0 ? 'text-viridial-600' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-base mb-1 truncate ${node.level === 0 ? 'text-viridial-900' : 'text-gray-900'}`}>
                    {node.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{node.slug}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0 hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(node.id, e);
                }}
                title={t('viewDetails')}
              >
                <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
              </Button>
            </div>

            {node.description && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{node.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={`${planColors[node.plan]} text-xs px-2 py-0.5 font-medium border-0`}>
                {t(`plans.${node.plan}`)}
              </Badge>
              {node.isActive ? (
                <Badge variant="success" className="gap-1 text-xs px-2 py-0.5 font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  {tCommon('active')}
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1 text-xs px-2 py-0.5 font-medium">
                  <XCircle className="h-3 w-3" />
                  {tCommon('inactive')}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">{t('users')}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {node.activeUserCount}/{node.maxUsers}
                  </p>
                </div>
              </div>
              {(node.city || node.country) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">{t('location')}</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {node.city && node.country ? `${node.city}, ${node.country}` : node.city || node.country}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {hasChildren && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {t('subOrganizations')}: <span className="font-semibold text-gray-700">{childrenCount}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enfants avec lignes de connexion */}
        {hasChildren && (
          <div className="flex flex-col items-center mt-4 relative w-full">
            {/* Ligne verticale du parent vers les enfants */}
            <div className="w-0.5 h-8 bg-gray-300" />
            
            {/* Ligne horizontale connectant tous les enfants (si plusieurs) */}
            {childrenCount > 1 && (
              <div 
                className="absolute h-0.5 bg-gray-300"
                style={{
                  top: '2rem',
                  left: `${50 - ((childrenCount - 1) * 12.5)}%`,
                  width: `${(childrenCount - 1) * 25}%`,
                }}
              />
            )}

            {/* Conteneur horizontal pour les enfants */}
            <div className="relative flex gap-6 items-start mt-2">
              {node.children.map((child, index) => (
                <div key={child.id} className="flex flex-col items-center relative">
                  {/* Ligne verticale depuis la ligne horizontale ou directement du parent */}
                  {childrenCount > 1 ? (
                    <div 
                      className="absolute w-0.5 bg-gray-300"
                      style={{
                        top: '-2rem',
                        height: '2rem',
                      }}
                    />
                  ) : (
                    <div className="w-0.5 h-4 bg-gray-300 mb-2" />
                  )}
                  {/* Enfant récursif */}
                  {renderNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full overflow-auto bg-white min-h-full">
      <div className="flex justify-center min-w-full py-12 px-8">
        <div className="relative">
          {renderNode(tree)}
        </div>
      </div>
    </div>
  );
}
