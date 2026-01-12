'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip } from '@/components/ui/tooltip';
import {
  Plus,
  Grid3x3,
  List,
  Edit,
  Trash2,
  Sparkles,
  TrendingUp,
  Building2,
  Zap,
  Crown,
  ChevronDown,
  ChevronUp,
  Check,
  Eye,
  Infinity,
  Users,
  Search,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { planApi, PlanApiError } from '@/lib/plan-api';
import { AuthGuard } from '@/middleware/auth-guard';
import { PlansStatsCards } from '@/components/plans/PlansStatsCards';
import type { Plan, PlanFilters, PlanType } from '@/types/plans';

export default function PlansManagementPage() {
  const t = useTranslations('admin.plans');
  const router = useRouter();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());
  const [expandedLimits, setExpandedLimits] = useState<Set<string>>(new Set());
  const [expandedTableRows, setExpandedTableRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlanType, setFilterPlanType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filters, setFilters] = useState<PlanFilters>({
    billingPeriod,
  });

  const loadPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await planApi.getAll({
        ...filters,
        billingPeriod,
      });
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
      toast({
        title: t('errors.loadFailed') || 'Failed to load plans',
        description: error instanceof PlanApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, billingPeriod, toast, t]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    const newFilters: PlanFilters = {
      billingPeriod,
    };
    
    if (filterPlanType !== 'all') {
      newFilters.planType = filterPlanType as PlanType;
    }
    
    if (filterStatus !== 'all') {
      newFilters.isActive = filterStatus === 'active';
    }
    
    setFilters(newFilters);
  }, [billingPeriod, filterPlanType, filterStatus]);

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

  // Filter plans by search query
  const filteredPlans = useMemo(() => {
    let filtered = plans;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (plan) =>
          plan.name.toLowerCase().includes(query) ||
          plan.description?.toLowerCase().includes(query) ||
          plan.internalCode.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [plans, searchQuery]);

  const handleCreatePlan = () => {
    router.push('/admin/plans/new');
  };

  const handleEditPlan = (plan: Plan) => {
    router.push(`/admin/plans/${plan.id}/edit`);
  };

  const handleDeletePlan = async (plan: Plan) => {
    if (!confirm(t('confirmDelete') || `Are you sure you want to delete "${plan.name}"?`)) {
      return;
    }

    try {
      await planApi.delete(plan.id);
      toast({
        title: t('success.delete') || 'Plan deleted',
        variant: 'success',
      });
      loadPlans();
    } catch (error) {
      console.error('Failed to delete plan:', error);
      toast({
        title: t('errors.deleteFailed') || 'Failed to delete plan',
        description: error instanceof PlanApiError ? error.message : 'An error occurred',
        variant: 'error',
      });
    }
  };

  const toggleExpanded = (planId: string, type: 'features' | 'limits' | 'table') => {
    if (type === 'table') {
      setExpandedTableRows((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(planId)) {
          newSet.delete(planId);
        } else {
          newSet.add(planId);
        }
        return newSet;
      });
    } else if (type === 'features') {
      setExpandedFeatures((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(planId)) {
          newSet.delete(planId);
        } else {
          newSet.add(planId);
        }
        return newSet;
      });
    } else if (type === 'limits') {
      setExpandedLimits((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(planId)) {
          newSet.delete(planId);
        } else {
          newSet.add(planId);
        }
        return newSet;
      });
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

  return (
    <AuthGuard>
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="flex-shrink-0 border-b border-gray-200 bg-white z-10">
            <div className="px-6 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {t('title') || 'Plans Management'}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {t('subtitle') || 'Manage subscription plans and pricing'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Billing Period Toggle */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setBillingPeriod('monthly')}
                      className={`h-7 px-3 text-xs ${
                        billingPeriod === 'monthly'
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('monthly') || 'Monthly'}
                    </Button>
                    <Button
                      variant={billingPeriod === 'annual' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setBillingPeriod('annual')}
                      className={`h-7 px-3 text-xs ${
                        billingPeriod === 'annual'
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {t('annual') || 'Annual'}
                    </Button>
                  </div>

                  <Button
                    className="gap-2 bg-viridial-600 hover:bg-viridial-700 text-sm h-9 px-4"
                    onClick={handleCreatePlan}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t('newPlan') || 'New Plan'}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Fixed Top Section */}
            <div className="flex-shrink-0 p-6 pb-4 space-y-4 overflow-hidden">
              {/* Stats Cards */}
              <PlansStatsCards plans={plans} />

              {/* Filter Bar */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t('searchPlaceholder') || 'Search plans...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-sm border-gray-200"
                    />
                  </div>

                  <Select value={filterPlanType} onValueChange={setFilterPlanType}>
                    <SelectTrigger className="w-40 h-9 text-sm border-gray-200">
                      <SelectValue placeholder={t('allPlanTypes') || 'All Types'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allPlanTypes') || 'All Types'}</SelectItem>
                      <SelectItem value="pilot">{t('planTypes.pilot') || 'Pilot'}</SelectItem>
                      <SelectItem value="growth">{t('planTypes.growth') || 'Growth'}</SelectItem>
                      <SelectItem value="professional">
                        {t('planTypes.professional') || 'Professional'}
                      </SelectItem>
                      <SelectItem value="enterprise">
                        {t('planTypes.enterprise') || 'Enterprise'}
                      </SelectItem>
                      <SelectItem value="ai">{t('planTypes.ai') || 'AI'}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40 h-9 text-sm border-gray-200">
                      <SelectValue placeholder={t('allStatuses') || 'All Statuses'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allStatuses') || 'All Statuses'}</SelectItem>
                      <SelectItem value="active">{t('active') || 'Active'}</SelectItem>
                      <SelectItem value="inactive">{t('inactive') || 'Inactive'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Header */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">
                    {t('showing') || 'Showing'} {filteredPlans.length} {t('results') || 'results'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip content={t('gridView') || 'Grid view'}>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`h-7 px-3 gap-1.5 transition-all duration-200 ease-out ${
                        viewMode === 'grid'
                          ? 'bg-viridial-600 hover:bg-viridial-700 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Grid3x3 className="h-3.5 w-3.5" />
                      {t('gridView') || 'Grid'}
                    </Button>
                  </Tooltip>
                  <Tooltip content={t('tableView') || 'Table view'}>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className={`h-7 px-3 gap-1.5 transition-all duration-200 ease-out ${
                        viewMode === 'table'
                          ? 'bg-viridial-600 hover:bg-viridial-700 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <List className="h-3.5 w-3.5" />
                      {t('tableView') || 'Table'}
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Scrollable Results Area */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viridial-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{t('loading') || 'Loading...'}</p>
                  </div>
                </div>
              ) : filteredPlans.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                  <div className="text-gray-500 mb-2">{t('noPlans') || 'No plans found'}</div>
                  <div className="text-sm text-gray-400">
                    {searchQuery ? t('tryDifferentSearch') || 'Try a different search term' : t('createFirstPlan') || 'Create your first plan'}
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPlans.map((plan) => {
                    const Icon = planIcons[plan.planType] || Sparkles;
                    const colorClass = planColors[plan.planType] || 'bg-gray-100 text-gray-800';
                    const isFeaturesExpanded = expandedFeatures.has(plan.id);
                    const isLimitsExpanded = expandedLimits.has(plan.id);
                    const featuresByCategory = groupFeaturesByCategory(plan.features);

                    return (
                      <Card
                        key={plan.id}
                        className={`relative hover:shadow-lg transition-all duration-200 border-gray-200 bg-white ${
                          plan.isPopular ? 'border-2 border-viridial-500' : ''
                        }`}
                      >
                        {plan.isPopular && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-viridial-600 text-white text-xs">
                              {t('popular') || 'Popular'}
                            </Badge>
                          </div>
                        )}

                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`p-2 rounded-lg ${colorClass}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base font-semibold truncate">
                                  {plan.name}
                                </CardTitle>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                  {plan.description || plan.planType}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Pricing */}
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900">
                              ${Number(plan.standardPrice).toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500">
                              /{billingPeriod === 'monthly' ? t('month') || 'mo' : t('year') || 'yr'}
                            </span>
                          </div>

                          {plan.singleAppPrice && (
                            <p className="text-xs text-gray-500">
                              {t('singleAppPrice') || 'Single App'}: ${Number(plan.singleAppPrice).toFixed(2)}
                            </p>
                          )}

                          {/* Status Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={plan.isActive ? 'success' : 'destructive'}
                              className="text-xs"
                            >
                              {plan.isActive ? t('active') || 'Active' : t('inactive') || 'Inactive'}
                            </Badge>
                            <Badge className={`${colorClass} text-xs`}>
                              {plan.planType}
                            </Badge>
                            {plan.isFeatured && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                {t('featured') || 'Featured'}
                              </Badge>
                            )}
                          </div>

                          {/* Features Preview */}
                          {plan.features && plan.features.length > 0 && (
                            <div className="border-t pt-3">
                              <button
                                onClick={() => toggleExpanded(plan.id, 'features')}
                                className="flex items-center justify-between w-full text-left hover:text-viridial-600 transition-colors"
                              >
                                <span className="text-sm font-semibold text-gray-700">
                                  {t('features') || 'Features'} ({plan.features.length})
                                </span>
                                {isFeaturesExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                              {isFeaturesExpanded && (
                                <div className="mt-3 space-y-3">
                                  {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
                                    <div key={category}>
                                      <div className="text-xs font-medium text-gray-500 uppercase mb-2">
                                        {category}
                                      </div>
                                      <div className="space-y-1.5">
                                        {categoryFeatures.map((feature) => (
                                          <div
                                            key={feature.id}
                                            className="flex items-start gap-2 text-sm text-gray-700"
                                          >
                                            <Check className="h-4 w-4 text-viridial-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                              <div className="font-medium">{feature.name}</div>
                                              {feature.description && (
                                                <div className="text-xs text-gray-500">
                                                  {feature.description}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Limits Preview */}
                          {plan.limits && plan.limits.length > 0 && (
                            <div className="border-t pt-3">
                              <button
                                onClick={() => toggleExpanded(plan.id, 'limits')}
                                className="flex items-center justify-between w-full text-left hover:text-viridial-600 transition-colors"
                              >
                                <span className="text-sm font-semibold text-gray-700">
                                  {t('limits') || 'Limits'} ({plan.limits.length})
                                </span>
                                {isLimitsExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                              {isLimitsExpanded && (
                                <div className="mt-3 space-y-2">
                                  {plan.limits.map((limit) => (
                                    <div
                                      key={limit.id}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <span className="text-gray-700">{limit.limitName}</span>
                                      <span className="font-medium text-gray-900">
                                        {limit.isUnlimited ? (
                                          <Infinity className="h-4 w-4 inline" />
                                        ) : (
                                          `${limit.limitValue || 0} ${limit.limitUnit || ''}`
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/plans/${plan.id}`)}
                              className="flex-1 h-8 text-xs"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              {t('view') || 'View'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPlan(plan)}
                              className="h-8 w-8 p-0"
                              title={t('edit') || 'Edit'}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePlan(plan)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title={t('delete') || 'Delete'}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('plan') || 'Plan'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('type') || 'Type'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('price') || 'Price'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('features') || 'Features'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('status') || 'Status'}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('actions') || 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPlans.map((plan) => {
                        const Icon = planIcons[plan.planType] || Sparkles;
                        const colorClass = planColors[plan.planType] || 'bg-gray-100 text-gray-800';
                        const isExpanded = expandedTableRows.has(plan.id);
                        const featuresByCategory = groupFeaturesByCategory(plan.features);

                        return (
                          <>
                            <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${colorClass}`}>
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {plan.name}
                                    </div>
                                    <div className="text-xs text-gray-500">{plan.internalCode}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <Badge className={`${colorClass} text-xs`}>
                                  {plan.planType}
                                </Badge>
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  ${Number(plan.standardPrice).toFixed(2)}
                                </div>
                                {plan.singleAppPrice && (
                                  <div className="text-xs text-gray-500">
                                    {t('singleApp') || 'Single'}: ${Number(plan.singleAppPrice).toFixed(2)}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm text-gray-900">
                                  {plan.features?.length || 0} {t('features') || 'features'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {plan.limits?.length || 0} {t('limits') || 'limits'}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={plan.isActive ? 'success' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {plan.isActive ? t('active') || 'Active' : t('inactive') || 'Inactive'}
                                  </Badge>
                                  {plan.isPopular && (
                                    <Badge className="bg-viridial-600 text-white text-xs">
                                      {t('popular') || 'Popular'}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push(`/admin/plans/${plan.id}`)}
                                    className="h-8 w-8 p-0"
                                    title={t('viewDetails') || 'View Details'}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditPlan(plan)}
                                    className="h-8 w-8 p-0"
                                    title={t('edit') || 'Edit'}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletePlan(plan)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title={t('delete') || 'Delete'}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleExpanded(plan.id, 'table')}
                                    className="h-7 text-xs"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <ChevronUp className="h-3.5 w-3.5 mr-1" />
                                        {t('hide') || 'Hide'}
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="h-3.5 w-3.5 mr-1" />
                                        {t('show') || 'Show'}
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={6} className="px-4 py-4 bg-gray-50">
                                  <div className="grid grid-cols-2 gap-6">
                                    {/* Features */}
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                        {t('features') || 'Features'}
                                      </h4>
                                      <div className="space-y-4">
                                        {Object.entries(featuresByCategory).map(
                                          ([category, categoryFeatures]) => (
                                            <div key={category}>
                                              <div className="text-xs font-medium text-gray-500 uppercase mb-2">
                                                {category}
                                              </div>
                                              <div className="space-y-1.5">
                                                {categoryFeatures.map((feature) => (
                                                  <div
                                                    key={feature.id}
                                                    className="flex items-start gap-2 text-sm text-gray-700"
                                                  >
                                                    <Check className="h-4 w-4 text-viridial-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                      <div className="font-medium">{feature.name}</div>
                                                      {feature.description && (
                                                        <div className="text-xs text-gray-500">
                                                          {feature.description}
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>

                                    {/* Limits */}
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                        {t('limits') || 'Limits'}
                                      </h4>
                                      <div className="space-y-2">
                                        {plan.limits?.map((limit) => (
                                          <div
                                            key={limit.id}
                                            className="flex items-center justify-between text-sm py-1"
                                          >
                                            <span className="text-gray-700">{limit.limitName}</span>
                                            <span className="font-medium text-gray-900">
                                              {limit.isUnlimited ? (
                                                <Infinity className="h-4 w-4 inline" />
                                              ) : (
                                                `${limit.limitValue || 0} ${limit.limitUnit || ''}`
                                              )}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
