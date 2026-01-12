'use client';

import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AuthGuard } from '@/middleware/auth-guard';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Sparkles,
  TrendingUp,
  Building2,
  Zap,
  Crown,
  Check,
  Infinity,
  Users,
  DollarSign,
  Calendar,
  CreditCard,
  Loader2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Pencil,
  Settings,
  Plus,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { planApi, PlanApiError } from '@/lib/plan-api';
import { subscriptionApi, SubscriptionApiError } from '@/lib/subscription-api';
import type { Plan, Subscription, PlanFilters, UpdatePlanDto, CreatePlanFeatureDto, CreatePlanLimitDto, PlanFeature, PlanLimit } from '@/types/plans';

// Lazy load modals
const EditPlanModal = dynamic(() => import('@/components/plans/EditPlanModal').then(mod => ({ default: mod.EditPlanModal })), {
  loading: () => null,
  ssr: false,
});

const CreatePlanFeatureModal = dynamic(() => import('@/components/plans/CreatePlanFeatureModal').then(mod => ({ default: mod.CreatePlanFeatureModal })), {
  loading: () => null,
  ssr: false,
});

const EditPlanFeatureModal = dynamic(() => import('@/components/plans/EditPlanFeatureModal').then(mod => ({ default: mod.EditPlanFeatureModal })), {
  loading: () => null,
  ssr: false,
});

const CreatePlanLimitModal = dynamic(() => import('@/components/plans/CreatePlanLimitModal').then(mod => ({ default: mod.CreatePlanLimitModal })), {
  loading: () => null,
  ssr: false,
});

const EditPlanLimitModal = dynamic(() => import('@/components/plans/EditPlanLimitModal').then(mod => ({ default: mod.EditPlanLimitModal })), {
  loading: () => null,
  ssr: false,
});

const ConfirmationDialog = dynamic(() => import('@/components/ui/confirmation-dialog').then(mod => ({ default: mod.ConfirmationDialog })), {
  loading: () => null,
  ssr: false,
});

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('admin.plans');
  const tCommon = useTranslations('common');
  const planId = params.id as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Modal states
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [isCreateFeatureModalOpen, setIsCreateFeatureModalOpen] = useState(false);
  const [isEditFeatureModalOpen, setIsEditFeatureModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<PlanFeature | null>(null);
  const [isCreateLimitModalOpen, setIsCreateLimitModalOpen] = useState(false);
  const [isEditLimitModalOpen, setIsEditLimitModalOpen] = useState(false);
  const [editingLimit, setEditingLimit] = useState<PlanLimit | null>(null);
  
  // Confirmation dialog states
  const [confirmDelete, setConfirmDelete] = useState({ open: false });
  const [confirmSavePlan, setConfirmSavePlan] = useState({ open: false, data: null as UpdatePlanDto | null });
  const [confirmDeleteFeature, setConfirmDeleteFeature] = useState({ open: false, featureId: null as string | null });
  const [confirmDeleteLimit, setConfirmDeleteLimit] = useState({ open: false, limitId: null as string | null });

  const planIcons: Record<string, typeof Sparkles> = {
    pilot: Sparkles,
    growth: TrendingUp,
    professional: Building2,
    enterprise: Zap,
    ai: Crown,
  };

  const planColors: Record<string, string> = {
    pilot: 'bg-purple-100 text-purple-800',
    growth: 'bg-blue-100 text-blue-800',
    professional: 'bg-green-100 text-green-800',
    enterprise: 'bg-orange-100 text-orange-800',
    ai: 'bg-viridial-100 text-viridial-800',
  };

  const statusColors: Record<string, string> = {
    trial: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
  };

  const loadData = useCallback(async () => {
    if (!planId) return;

    try {
      setIsLoading(true);
      const [planData, subscriptionsData] = await Promise.all([
        planApi.getById(planId),
        subscriptionApi.getAll({ planId }),
      ]);
      setPlan(planData);
      setSubscriptions(subscriptionsData);
    } catch (error) {
      console.error('Failed to load plan:', error);
      toast({
        title: t('errors.loadFailed') || 'Failed to load plan',
        description: error instanceof PlanApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
      router.push('/admin/plans');
    } finally {
      setIsLoading(false);
    }
  }, [planId, router, toast, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditPlan = () => {
    setIsEditPlanModalOpen(true);
  };

  const handleCreateFeature = () => {
    setIsCreateFeatureModalOpen(true);
  };

  const handleEditFeature = (feature: PlanFeature) => {
    setEditingFeature(feature);
    setIsEditFeatureModalOpen(true);
  };

  const handleCreateLimit = () => {
    setIsCreateLimitModalOpen(true);
  };

  const handleEditLimit = (limit: PlanLimit) => {
    setEditingLimit(limit);
    setIsEditLimitModalOpen(true);
  };

  const handleSavePlan = async (data: UpdatePlanDto) => {
    if (!plan) return;
    
    // Show confirmation dialog
    setConfirmSavePlan({ open: true, data });
  };

  const handleConfirmSavePlan = async () => {
    if (!plan || !confirmSavePlan.data) return;

    try {
      const updatedPlan = await planApi.update(planId, confirmSavePlan.data);
      setPlan(updatedPlan);
      toast({
        title: t('planUpdated') || 'Plan updated',
        description: t('planUpdatedDescription') || 'The plan has been updated successfully',
        variant: 'success',
      });
      setConfirmSavePlan({ open: false, data: null });
      setIsEditPlanModalOpen(false);
    } catch (error) {
      console.error('Failed to update plan:', error);
      toast({
        title: t('errors.updateFailed') || 'Failed to update plan',
        description: error instanceof PlanApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    }
  };

  const handleSaveFeature = async (featureDto: CreatePlanFeatureDto) => {
    if (!plan) return;
    
    // Convert existing features to DTO format and add the new one
    const currentFeatures: CreatePlanFeatureDto[] = (plan.features || []).map((f) => ({
      name: f.name,
      description: f.description || '',
      category: f.category,
      isIncluded: f.isIncluded ?? true,
      displayOrder: f.displayOrder ?? 0,
    }));
    
    currentFeatures.push(featureDto);
    
    try {
      const updatedPlan = await planApi.update(planId, { features: currentFeatures });
      setPlan(updatedPlan);
      toast({
        title: t('featureAdded') || 'Feature added',
        description: t('featureAddedDescription') || 'The feature has been added successfully',
        variant: 'success',
      });
      setIsCreateFeatureModalOpen(false);
    } catch (error) {
      console.error('Failed to add feature:', error);
      toast({
        title: t('errors.updateFailed') || 'Failed to add feature',
        description: error instanceof PlanApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    }
  };

  const handleUpdateFeature = async (featureDto: CreatePlanFeatureDto) => {
    if (!plan || !editingFeature) return;
    
    // Convert existing features to DTO format and replace the edited one
    const currentFeatures: CreatePlanFeatureDto[] = (plan.features || []).map((f) => {
      if (f.id === editingFeature.id) {
        return featureDto;
      }
      return {
        name: f.name,
        description: f.description || '',
        category: f.category,
        isIncluded: f.isIncluded ?? true,
        displayOrder: f.displayOrder ?? 0,
      };
    });
    
    try {
      const updatedPlan = await planApi.update(planId, { features: currentFeatures });
      setPlan(updatedPlan);
      toast({
        title: t('featureUpdated') || 'Feature updated',
        description: t('featureUpdatedDescription') || 'The feature has been updated successfully',
        variant: 'success',
      });
      setIsEditFeatureModalOpen(false);
      setEditingFeature(null);
    } catch (error) {
      console.error('Failed to update feature:', error);
      toast({
        title: t('errors.updateFailed') || 'Failed to update feature',
        description: error instanceof PlanApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    }
  };

  const handleDeleteFeature = async (featureId: string) => {
    if (!plan) return;
    
    // Convert existing features to DTO format and remove the deleted one
    const currentFeatures: CreatePlanFeatureDto[] = (plan.features || [])
      .filter((f) => f.id !== featureId)
      .map((f) => ({
        name: f.name,
        description: f.description || '',
        category: f.category,
        isIncluded: f.isIncluded ?? true,
        displayOrder: f.displayOrder ?? 0,
      }));
    
    try {
      const updatedPlan = await planApi.update(planId, { features: currentFeatures });
      setPlan(updatedPlan);
      toast({
        title: t('featureDeleted') || 'Feature deleted',
        description: t('featureDeletedDescription') || 'The feature has been deleted successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to delete feature:', error);
      toast({
        title: t('errors.updateFailed') || 'Failed to delete feature',
        description: error instanceof PlanApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    }
  };

  const handleSaveLimit = async (limitDto: CreatePlanLimitDto) => {
    if (!plan) return;
    
    // Convert existing limits to DTO format and add the new one
    const currentLimits: CreatePlanLimitDto[] = (plan.limits || []).map((l) => ({
      limitType: l.limitType,
      limitName: l.limitName,
      limitValue: l.limitValue ?? undefined,
      limitUnit: l.limitUnit ?? undefined,
      isUnlimited: l.isUnlimited ?? false,
      description: l.description || '',
    }));
    
    currentLimits.push(limitDto);
    
    try {
      const updatedPlan = await planApi.update(planId, { limits: currentLimits });
      setPlan(updatedPlan);
      toast({
        title: t('limitAdded') || 'Limit added',
        description: t('limitAddedDescription') || 'The limit has been added successfully',
        variant: 'success',
      });
      setIsCreateLimitModalOpen(false);
    } catch (error) {
      console.error('Failed to add limit:', error);
      toast({
        title: t('errors.updateFailed') || 'Failed to add limit',
        description: error instanceof PlanApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    }
  };

  const handleUpdateLimit = async (limitDto: CreatePlanLimitDto) => {
    if (!plan || !editingLimit) return;
    
    // Convert existing limits to DTO format and replace the edited one
    const currentLimits: CreatePlanLimitDto[] = (plan.limits || []).map((l) => {
      if (l.id === editingLimit.id) {
        return limitDto;
      }
      return {
        limitType: l.limitType,
        limitName: l.limitName,
        limitValue: l.limitValue ?? undefined,
        limitUnit: l.limitUnit ?? undefined,
        isUnlimited: l.isUnlimited ?? false,
        description: l.description || '',
      };
    });
    
    try {
      const updatedPlan = await planApi.update(planId, { limits: currentLimits });
      setPlan(updatedPlan);
      toast({
        title: t('limitUpdated') || 'Limit updated',
        description: t('limitUpdatedDescription') || 'The limit has been updated successfully',
        variant: 'success',
      });
      setIsEditLimitModalOpen(false);
      setEditingLimit(null);
    } catch (error) {
      console.error('Failed to update limit:', error);
      toast({
        title: t('errors.updateFailed') || 'Failed to update limit',
        description: error instanceof PlanApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    }
  };

  const handleDeleteLimit = async (limitId: string) => {
    if (!plan) return;
    
    // Convert existing limits to DTO format and remove the deleted one
    const currentLimits: CreatePlanLimitDto[] = (plan.limits || [])
      .filter((l) => l.id !== limitId)
      .map((l) => ({
        limitType: l.limitType,
        limitName: l.limitName,
        limitValue: l.limitValue ?? undefined,
        limitUnit: l.limitUnit ?? undefined,
        isUnlimited: l.isUnlimited ?? false,
        description: l.description || '',
      }));
    
    try {
      const updatedPlan = await planApi.update(planId, { limits: currentLimits });
      setPlan(updatedPlan);
      toast({
        title: t('limitDeleted') || 'Limit deleted',
        description: t('limitDeletedDescription') || 'The limit has been deleted successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to delete limit:', error);
      toast({
        title: t('errors.updateFailed') || 'Failed to delete limit',
        description: error instanceof PlanApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    }
  };

  const handleDelete = () => {
    setConfirmDelete({ open: true });
  };

  const handleConfirmDelete = async () => {
    if (!plan) return;

    try {
      setIsDeleting(true);
      await planApi.delete(planId);
      toast({
        title: t('planDeleted') || 'Plan deleted',
        description: t('planDeletedDescription') || 'The plan has been deleted successfully',
        variant: 'success',
      });
      router.push('/admin/plans');
    } catch (error) {
      console.error('Failed to delete plan:', error);
      toast({
        title: t('errors.deleteFailed') || 'Failed to delete plan',
        description: error instanceof PlanApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete({ open: false });
    }
  };

  const groupFeaturesByCategory = (features: Plan['features']) => {
    if (!features) return {};
    return features.reduce((acc, feature) => {
      const category = feature.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(feature);
      return acc;
    }, {} as Record<string, typeof features>);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const subscriptionsByStatus = useMemo(() => {
    if (!subscriptions) return {};
    return subscriptions.reduce((acc, sub) => {
      if (!acc[sub.status]) acc[sub.status] = [];
      acc[sub.status].push(sub);
      return acc;
    }, {} as Record<string, Subscription[]>);
  }, [subscriptions]);

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="h-screen bg-gray-50 flex overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-viridial-600" />
            <p className="mt-4 text-gray-600">{t('loading') || 'Loading...'}</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!plan) {
    return (
      <AuthGuard>
        <div className="h-screen bg-gray-50 flex overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col items-center justify-center">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>{t('planNotFound') || 'Plan not found'}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/admin/plans')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('backToPlans') || 'Back to Plans'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const Icon = planIcons[plan.planType] || Sparkles;
  const colorClass = planColors[plan.planType] || 'bg-gray-100 text-gray-800';
  const featuresByCategory = groupFeaturesByCategory(plan.features);

  return (
    <AuthGuard>
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="flex-shrink-0 border-b border-gray-200 bg-white z-10">
            <div className="px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="h-8 w-8 text-gray-600 hover:text-gray-900"
                    title={tCommon('back')}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">{plan.name}</h1>
                    <p className="text-xs text-gray-500">{t('planDetails') || 'Plan Details'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditPlan}
                    className="text-sm h-9 px-4 gap-2"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    {tCommon('edit') || t('edit') || 'Edit'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-sm h-9 px-4 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    {t('delete') || 'Delete'}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  {t('features') || 'Features'}
                </div>
                <div className="text-2xl font-bold text-gray-900">{plan.features?.length || 0}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  {t('limits') || 'Limits'}
                </div>
                <div className="text-2xl font-bold text-gray-900">{plan.limits?.length || 0}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  {t('subscriptions') || 'Subscriptions'}
                </div>
                <div className="text-2xl font-bold text-gray-900">{subscriptions.length}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  {t('createdAt') || 'Created At'}
                </div>
                <div className="text-sm font-medium text-gray-900">{formatDate(plan.createdAt)}</div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-white border border-gray-200">
                <TabsTrigger value="overview">{t('overview') || 'Overview'}</TabsTrigger>
                <TabsTrigger value="features">
                  {t('features') || 'Features'} ({plan.features?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="limits">
                  {t('limits') || 'Limits'} ({plan.limits?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="subscriptions">
                  {t('subscriptions') || 'Subscriptions'} ({subscriptions.length})
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Plan Information */}
                  <Card className="lg:col-span-2 border-gray-200 bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {t('planInformation') || 'Plan Information'}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditPlan}
                        className="gap-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {tCommon('edit') || t('edit') || 'Edit'}
                      </Button>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg border flex-shrink-0 ${colorClass}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-base font-semibold text-gray-900 mb-1">{plan.name}</h2>
                          <p className="text-sm text-gray-500 mb-3">{plan.internalCode}</p>
                          {plan.description && (
                            <p className="text-sm text-gray-700 leading-relaxed">{plan.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            {t('type') || 'Type'}
                          </p>
                          <Badge className={`${colorClass} text-xs px-2.5 py-1 font-medium`}>
                            {plan.planType}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            {t('status') || 'Status'}
                          </p>
                          {plan.isActive ? (
                            <Badge variant="success" className="gap-1.5 text-xs px-2.5 py-1 font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {tCommon('active') || t('active') || 'Active'}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1.5 text-xs px-2.5 py-1 font-medium">
                              <XCircle className="h-3.5 w-3.5" />
                              {tCommon('inactive') || t('inactive') || 'Inactive'}
                            </Badge>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            {t('billingPeriod') || 'Billing Period'}
                          </p>
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {plan.billingPeriod}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            {t('displayOrder') || 'Display Order'}
                          </p>
                          <div className="text-sm font-medium text-gray-900">{plan.displayOrder}</div>
                        </div>
                        {plan.externalCode && (
                          <div className="col-span-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                              {t('externalCode') || 'External Code'}
                            </p>
                            <div className="text-sm font-mono text-gray-900">{plan.externalCode}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                        {plan.isPopular && (
                          <Badge className="bg-viridial-600 text-white text-xs px-2.5 py-1">
                            {t('popular') || 'Popular'}
                          </Badge>
                        )}
                        {plan.isFeatured && (
                          <Badge variant="outline" className="text-xs px-2.5 py-1">
                            {t('featured') || 'Featured'}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pricing Card */}
                  <Card className="border-gray-200 bg-white">
                    <CardHeader className="pb-4 border-b border-gray-100">
                      <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-viridial-600" />
                        {t('pricing') || 'Pricing'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          {t('standardUser') || 'Standard User'}
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-gray-900">
                            ${Number(plan.standardPrice).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">
                            /{plan.billingPeriod === 'monthly' ? t('month') || 'mo' : t('year') || 'yr'}
                          </span>
                        </div>
                      </div>

                      {plan.singleAppPrice && (
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            {t('singleAppUser') || 'Single App User'}
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900">
                              ${Number(plan.singleAppPrice).toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500">
                              /{plan.billingPeriod === 'monthly' ? t('month') || 'mo' : t('year') || 'yr'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{t('createdAt') || 'Created'}</span>
                          <span className="font-medium text-gray-900">{formatDate(plan.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{t('updatedAt') || 'Updated'}</span>
                          <span className="font-medium text-gray-900">{formatDate(plan.updatedAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-6">
                <Card className="border-gray-200 bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {t('features') || 'Features'} ({plan.features?.length || 0})
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateFeature}
                      className="gap-2 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      {t('addFeature') || 'Add Feature'}
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {plan.features && plan.features.length > 0 ? (
                      <div className="space-y-8">
                        {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
                          <div key={category}>
                            {Object.keys(featuresByCategory).length > 1 && (
                              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                                {category}
                              </h3>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {categoryFeatures.map((feature) => (
                                <div
                                  key={feature.id}
                                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-viridial-300 transition-colors"
                                >
                                  <Check className="h-5 w-5 text-viridial-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 mb-1">{feature.name}</div>
                                    {feature.description && (
                                      <p className="text-sm text-gray-600 leading-relaxed">
                                        {feature.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-3">
                                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                                        {feature.internalCode}
                                      </Badge>
                                      {feature.category && (
                                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                                          {feature.category}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditFeature(feature)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setConfirmDeleteFeature({ open: true, featureId: feature.id })}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">{t('noFeatures') || 'No features found'}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Limits Tab */}
              <TabsContent value="limits" className="space-y-6">
                <Card className="border-gray-200 bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {t('limits') || 'Limits'} ({plan.limits?.length || 0})
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateLimit}
                      className="gap-2 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      {t('addLimit') || 'Add Limit'}
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {plan.limits && plan.limits.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plan.limits.map((limit) => (
                          <div
                            key={limit.id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-viridial-300 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 mb-1">{limit.limitName}</div>
                                {limit.description && (
                                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                    {limit.description}
                                  </p>
                                )}
                                <Badge variant="outline" className="text-xs px-2 py-0.5">
                                  {limit.limitType}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-shrink-0">
                                  {limit.isUnlimited ? (
                                    <div className="flex items-center gap-1 text-viridial-600 font-semibold">
                                      <Infinity className="h-5 w-5" />
                                      <span className="text-sm">{t('unlimited') || 'Unlimited'}</span>
                                    </div>
                                  ) : (
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-gray-900">
                                        {limit.limitValue || 0}
                                      </div>
                                      {limit.limitUnit && (
                                        <div className="text-xs text-gray-500">{limit.limitUnit}</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditLimit(limit)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setConfirmDeleteLimit({ open: true, limitId: limit.id })}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">{t('noLimits') || 'No limits found'}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Subscriptions Tab */}
              <TabsContent value="subscriptions" className="space-y-6">
                <Card className="border-gray-200 bg-white">
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {t('subscriptions') || 'Subscriptions'} ({subscriptions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {subscriptions.length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(subscriptionsByStatus).map(([status, statusSubscriptions]) => (
                          <div key={status}>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                              {status} ({statusSubscriptions.length})
                            </h3>
                            <div className="space-y-3">
                              {statusSubscriptions.map((subscription) => (
                                <div
                                  key={subscription.id}
                                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-viridial-300 transition-colors"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-3 mb-2">
                                        <Badge
                                          className={`${statusColors[subscription.status]} text-xs px-2.5 py-1 font-medium`}
                                        >
                                          {subscription.status}
                                        </Badge>
                                        <span className="text-sm font-medium text-gray-900">
                                          {subscription.internalCode}
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="text-gray-500">
                                            {t('standardUsers') || 'Standard Users'}:
                                          </span>
                                          <span className="ml-2 font-medium text-gray-900">
                                            {subscription.standardUsersCount}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">
                                            {t('singleAppUsers') || 'Single App Users'}:
                                          </span>
                                          <span className="ml-2 font-medium text-gray-900">
                                            {subscription.singleAppUsersCount}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">
                                            {t('monthlyAmount') || 'Monthly Amount'}:
                                          </span>
                                          <span className="ml-2 font-medium text-gray-900">
                                            {formatCurrency(subscription.monthlyAmount, subscription.currency)}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">
                                            {t('billingPeriod') || 'Billing Period'}:
                                          </span>
                                          <span className="ml-2 font-medium text-gray-900 capitalize">
                                            {subscription.billingPeriod}
                                          </span>
                                        </div>
                                      </div>
                                      {subscription.nextPaymentDate && (
                                        <div className="mt-3 text-xs text-gray-500">
                                          {t('nextPayment') || 'Next Payment'}:{' '}
                                          {formatDate(subscription.nextPaymentDate)}
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => router.push(`/organizations/${subscription.organizationId}`)}
                                      className="ml-4 flex-shrink-0"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">{t('noSubscriptions') || 'No subscriptions found'}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Modals */}
      {plan && (
        <>
          <EditPlanModal
            plan={plan}
            open={isEditPlanModalOpen}
            onOpenChange={setIsEditPlanModalOpen}
            onSave={handleSavePlan}
          />
          <CreatePlanFeatureModal
            open={isCreateFeatureModalOpen}
            onOpenChange={setIsCreateFeatureModalOpen}
            onSave={handleSaveFeature}
          />
          {editingFeature && (
            <EditPlanFeatureModal
              feature={editingFeature}
              open={isEditFeatureModalOpen}
              onOpenChange={(open) => {
                setIsEditFeatureModalOpen(open);
                if (!open) setEditingFeature(null);
              }}
              onSave={handleUpdateFeature}
            />
          )}
          <CreatePlanLimitModal
            open={isCreateLimitModalOpen}
            onOpenChange={setIsCreateLimitModalOpen}
            onSave={handleSaveLimit}
          />
          {editingLimit && (
            <EditPlanLimitModal
              limit={editingLimit}
              open={isEditLimitModalOpen}
              onOpenChange={(open) => {
                setIsEditLimitModalOpen(open);
                if (!open) setEditingLimit(null);
              }}
              onSave={handleUpdateLimit}
            />
          )}
        </>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete({ open })}
        title={t('confirmDelete') || 'Delete Plan'}
        description={t('confirmDeleteDescription') || 'Are you sure you want to delete this plan? This action cannot be undone. All subscriptions using this plan will be affected.'}
        variant="danger"
        confirmText={tCommon('delete') || 'Delete'}
        cancelText={tCommon('cancel') || 'Cancel'}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      <ConfirmationDialog
        open={confirmSavePlan.open}
        onOpenChange={(open) => setConfirmSavePlan({ open, data: open ? confirmSavePlan.data : null })}
        title={t('confirmSavePlan') || 'Save Plan Changes'}
        description={t('confirmSavePlanDescription') || 'Are you sure you want to save these changes to the plan?'}
        variant="warning"
        confirmText={tCommon('save') || 'Save'}
        cancelText={tCommon('cancel') || 'Cancel'}
        onConfirm={handleConfirmSavePlan}
      />

      <ConfirmationDialog
        open={confirmDeleteFeature.open}
        onOpenChange={(open) => setConfirmDeleteFeature({ open, featureId: open ? confirmDeleteFeature.featureId : null })}
        title={t('confirmDeleteFeature') || 'Delete Feature'}
        description={t('confirmDeleteFeatureDescription') || 'Are you sure you want to delete this feature? This action cannot be undone.'}
        variant="danger"
        confirmText={tCommon('delete') || 'Delete'}
        cancelText={tCommon('cancel') || 'Cancel'}
        onConfirm={() => {
          if (confirmDeleteFeature.featureId) {
            handleDeleteFeature(confirmDeleteFeature.featureId);
            setConfirmDeleteFeature({ open: false, featureId: null });
          }
        }}
      />

      <ConfirmationDialog
        open={confirmDeleteLimit.open}
        onOpenChange={(open) => setConfirmDeleteLimit({ open, limitId: open ? confirmDeleteLimit.limitId : null })}
        title={t('confirmDeleteLimit') || 'Delete Limit'}
        description={t('confirmDeleteLimitDescription') || 'Are you sure you want to delete this limit? This action cannot be undone.'}
        variant="danger"
        confirmText={tCommon('delete') || 'Delete'}
        cancelText={tCommon('cancel') || 'Cancel'}
        onConfirm={() => {
          if (confirmDeleteLimit.limitId) {
            handleDeleteLimit(confirmDeleteLimit.limitId);
            setConfirmDeleteLimit({ open: false, limitId: null });
          }
        }}
      />
    </AuthGuard>
  );
}
