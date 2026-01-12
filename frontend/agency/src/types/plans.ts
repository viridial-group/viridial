/**
 * Plan and Subscription Types
 * Based on Vtiger CRM pricing model
 */

export type PlanType = 'pilot' | 'growth' | 'professional' | 'enterprise' | 'ai';
export type BillingPeriod = 'monthly' | 'annual';
export type SubscriptionStatus = 'trial' | 'active' | 'suspended' | 'cancelled' | 'expired';
export type UserType = 'standard' | 'single_app';
export type SingleAppType = 'sales' | 'marketing' | 'support' | 'projects' | 'inventory';
export type FeatureCategory = 'ai' | 'sales' | 'marketing' | 'support' | 'inventory' | 'project' | 'analytics' | 'collaboration' | 'productivity' | 'integration' | 'administration' | 'other';
export type LimitType = 'users' | 'records' | 'storage' | 'emails' | 'api_calls' | 'integrations' | 'custom';
export type BoosterPackType = 'users' | 'storage' | 'emails' | 'api_calls' | 'records' | 'custom';

export interface PlanFeature {
  id: string;
  internalCode: string;
  planId: string;
  name: string;
  description?: string;
  category?: FeatureCategory;
  isIncluded: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanLimit {
  id: string;
  internalCode: string;
  planId: string;
  limitType: LimitType;
  limitName: string;
  limitValue?: number | null;
  limitUnit?: string | null;
  isUnlimited: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  internalCode: string;
  externalCode?: string | null;
  planType: PlanType;
  name: string;
  description?: string;
  billingPeriod: BillingPeriod;
  standardPrice: number;
  singleAppPrice?: number | null;
  displayOrder: number;
  isActive: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  features?: PlanFeature[];
  limits?: PlanLimit[];
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  internalCode: string;
  organizationId: string;
  planId: string;
  plan?: Plan;
  status: SubscriptionStatus;
  standardUsersCount: number;
  singleAppUsersCount: number;
  billingPeriod: BillingPeriod;
  monthlyAmount: number;
  currency: string;
  trialStartDate?: string | null;
  trialEndDate?: string | null;
  trialDays?: number | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string | null;
  lastPaymentDate?: string | null;
  nextPaymentDate?: string | null;
  paymentMethod?: string | null;
  userPlans?: UserPlan[];
  boosterPacks?: BoosterPack[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPlan {
  id: string;
  userId: string;
  subscriptionId: string;
  userType: UserType;
  singleAppType?: SingleAppType | null;
  createdAt: string;
  updatedAt: string;
}

export interface BoosterPack {
  id: string;
  internalCode: string;
  externalCode?: string | null;
  name: string;
  description?: string;
  boosterPackType: BoosterPackType;
  limitType: string;
  limitIncrease: number;
  limitUnit?: string | null;
  monthlyPrice: number;
  annualPrice?: number | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// DTOs
export interface CreatePlanDto {
  planType: PlanType;
  name: string;
  description?: string;
  billingPeriod: BillingPeriod;
  standardPrice: number;
  singleAppPrice?: number | null;
  displayOrder?: number;
  isActive?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  externalCode?: string | null;
  features?: CreatePlanFeatureDto[];
  limits?: CreatePlanLimitDto[];
}

export interface CreatePlanFeatureDto {
  name: string;
  description?: string;
  category?: FeatureCategory;
  isIncluded?: boolean;
  displayOrder?: number;
}

export interface CreatePlanLimitDto {
  limitType: LimitType;
  limitName: string;
  limitValue?: number | null;
  limitUnit?: string | null;
  isUnlimited?: boolean;
  description?: string;
}

export interface UpdatePlanDto {
  planType?: PlanType;
  name?: string;
  description?: string;
  billingPeriod?: BillingPeriod;
  standardPrice?: number;
  singleAppPrice?: number | null;
  displayOrder?: number;
  isActive?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  externalCode?: string | null;
  features?: CreatePlanFeatureDto[];
  limits?: CreatePlanLimitDto[];
}

export interface CreateSubscriptionDto {
  organizationId: string;
  planId: string;
  status?: SubscriptionStatus;
  standardUsersCount?: number;
  singleAppUsersCount?: number;
  billingPeriod?: BillingPeriod;
  monthlyAmount?: number;
  currency?: string;
  trialDays?: number | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
}

export interface UpdateSubscriptionDto {
  planId?: string;
  status?: SubscriptionStatus;
  standardUsersCount?: number;
  singleAppUsersCount?: number;
  billingPeriod?: BillingPeriod;
  monthlyAmount?: number;
  currency?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
}

export interface CreateBoosterPackDto {
  name: string;
  description?: string;
  boosterPackType: BoosterPackType;
  limitType: string;
  limitIncrease: number;
  limitUnit?: string | null;
  monthlyPrice: number;
  annualPrice?: number | null;
  isActive?: boolean;
  displayOrder?: number;
  externalCode?: string | null;
}

export interface UpdateBoosterPackDto {
  name?: string;
  description?: string;
  boosterPackType?: BoosterPackType;
  limitType?: string;
  limitIncrease?: number;
  limitUnit?: string | null;
  monthlyPrice?: number;
  annualPrice?: number | null;
  isActive?: boolean;
  displayOrder?: number;
  externalCode?: string | null;
}

// Filters
export interface PlanFilters {
  planType?: PlanType;
  billingPeriod?: BillingPeriod;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface SubscriptionFilters {
  organizationId?: string;
  planId?: string;
  status?: SubscriptionStatus;
}

export interface BoosterPackFilters {
  boosterPackType?: BoosterPackType;
  isActive?: boolean;
  limitType?: string;
}

