'use client';

import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  getOrganizationById, 
  getOrganizationTree,
  getRootOrganization,
} from '@/data/mockData';
import { Sidebar } from '@/components/navigation/Sidebar';
import { OrganizationChart } from '@/components/organizations/OrganizationChart';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Network, AlertCircle } from 'lucide-react';

export default function OrganizationChartPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('organizations');
  const tCommon = useTranslations('common');
  
  const organizationId = params.id as string;
  const organization = getOrganizationById(organizationId);
  
  if (!organization) {
    return (
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <Card className="max-w-md w-full">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('organizationNotFound')}</h2>
                <p className="text-sm text-gray-500 mb-6">{t('organizationNotFoundDescription')}</p>
                <Button onClick={() => router.push('/')} variant="outline">
                  {tCommon('backToHome')}
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  // Obtenir l'arbre complet depuis la racine
  const rootOrg = getRootOrganization(organizationId);
  const tree = rootOrg ? getOrganizationTree(rootOrg.id) : null;

  if (!tree) {
    return (
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <Card className="max-w-md w-full">
              <CardContent className="pt-6 text-center">
                <Network className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('noOrganizationHierarchy')}</h2>
                <p className="text-sm text-gray-500 mb-6">{t('noOrganizationHierarchyDescription')}</p>
                <Button onClick={() => router.push(`/organizations/${organizationId}`)} variant="outline">
                  {tCommon('back')}
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header fixe */}
        <header className="flex-shrink-0 border-b border-gray-200 bg-white z-10">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/organizations/${organizationId}`)}
                  className="h-8 w-8 text-gray-600 hover:text-gray-900"
                  title={tCommon('back')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Network className="h-5 w-5 text-viridial-600" />
                    {t('organizationChart')}
                  </h1>
                  <p className="text-xs text-gray-500">{organization.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/organizations/${organizationId}`)}
                  className="text-sm h-9 px-4"
                >
                  {t('viewDetails')}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="m-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <OrganizationChart
              tree={tree}
              onOrganizationClick={(id) => router.push(`/organizations/${id}`)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

