'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthApiError, authApi } from '@/lib/auth-api';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

type Step = 'user' | 'organization';

interface UserFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  preferredLanguage: string;
}

interface OrganizationFormData {
  name: string;
  slug: string;
  description: string;
  plan: 'free' | 'basic' | 'professional' | 'enterprise';
  country: string;
  city: string;
  website: string;
  industry: string;
}

export function SignupForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [userData, setUserData] = useState<UserFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    preferredLanguage: 'en',
  });

  const [organizationData, setOrganizationData] = useState<OrganizationFormData>({
    name: '',
    slug: '',
    description: '',
    plan: 'professional',
    country: '',
    city: '',
    website: '',
    industry: '',
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    organization?: {
      name?: string;
      slug?: string;
      description?: string;
    };
    general?: string;
  }>({});

  // Generate slug from organization name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const validateUserStep = (): boolean => {
    const newErrors: typeof errors = {};

    if (!userData.email.trim()) {
      newErrors.email = t('errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = t('errors.emailInvalid');
    }

    if (!userData.password) {
      newErrors.password = t('errors.passwordRequired');
    } else if (userData.password.length < 8) {
      newErrors.password = t('errors.passwordMinLength');
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
      newErrors.password = t('errors.passwordWeak');
    }

    if (!userData.confirmPassword) {
      newErrors.confirmPassword = t('errors.confirmPasswordRequired');
    } else if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = t('errors.passwordsDoNotMatch');
    }

    if (userData.firstName && userData.firstName.length > 100) {
      newErrors.firstName = t('errors.firstNameTooLong');
    }

    if (userData.lastName && userData.lastName.length > 100) {
      newErrors.lastName = t('errors.lastNameTooLong');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOrganizationStep = (): boolean => {
    const newErrors: typeof errors = {
      organization: {},
    };

    if (!organizationData.name.trim()) {
      newErrors.organization!.name = t('signup.errors.organizationNameRequired');
    } else if (organizationData.name.length > 400) {
      newErrors.organization!.name = t('signup.errors.organizationNameTooLong');
    }

    // Auto-generate slug if empty
    if (!organizationData.slug.trim()) {
      setOrganizationData((prev) => ({
        ...prev,
        slug: generateSlug(organizationData.name),
      }));
    } else if (!/^[a-z0-9-]+$/.test(organizationData.slug)) {
      newErrors.organization!.slug = t('signup.errors.invalidSlug');
    }

    if (organizationData.description && organizationData.description.length > 5000) {
      newErrors.organization!.description = t('signup.errors.descriptionTooLong');
    }

    setErrors(newErrors);
    return Object.keys(newErrors.organization || {}).length === 0;
  };

  const handleUserStepSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateUserStep()) {
      setCurrentStep('organization');
    }
  };

  const handleOrganizationStepSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateOrganizationStep()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authApi.signupWithOrganization({
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        firstName: userData.firstName || undefined,
        lastName: userData.lastName || undefined,
        phone: userData.phone || undefined,
        preferredLanguage: userData.preferredLanguage || undefined,
        organization: {
          name: organizationData.name,
          slug: organizationData.slug || generateSlug(organizationData.name),
          description: organizationData.description || undefined,
          plan: organizationData.plan,
          country: organizationData.country || undefined,
          city: organizationData.city || undefined,
          website: organizationData.website || undefined,
          industry: organizationData.industry || undefined,
        },
      });

      // Store tokens and update auth context
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Decode JWT to get user info
      try {
        const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
        const userData = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          organizationId: payload.organizationId || null,
        };
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (decodeError) {
        console.error('Error decoding JWT:', decodeError);
      }
      
      // Reload page to update auth context
      window.location.href = '/';

      toast({
        title: t('signup.success.title'),
        description: t('signup.success.description'),
        variant: 'success',
      });

      // Redirect to dashboard
      router.push('/');
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error instanceof AuthApiError) {
        if (error.statusCode === 409) {
          setErrors({
            email: t('errors.emailAlreadyExists'),
          });
        } else if (error.statusCode === 400) {
          setErrors({
            general: error.message || t('signup.errors.validationFailed'),
          });
        } else {
          setErrors({
            general: error.message || t('signup.errors.signupFailed'),
          });
        }
      } else {
        setErrors({
          general: t('signup.errors.signupFailed'),
        });
      }

      toast({
        title: t('signup.errors.signupFailed'),
        description: errors.general || t('signup.errors.signupFailedDescription'),
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === 'user') {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-gray-200 bg-white">
        <CardHeader>
          <CardTitle>{t('signup.steps.user.title')}</CardTitle>
          <CardDescription>{t('signup.steps.user.description')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleUserStepSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('signup.fields.firstName')}</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={userData.firstName}
                  onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                  placeholder={t('signup.fields.firstNamePlaceholder')}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">{t('signup.fields.lastName')}</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={userData.lastName}
                  onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                  placeholder={t('signup.fields.lastNamePlaceholder')}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('signup.fields.email')}</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                placeholder={t('signup.fields.emailPlaceholder')}
                required
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('signup.fields.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                placeholder={t('signup.fields.phonePlaceholder')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t('signup.fields.password')}</Label>
                <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={userData.password}
                      onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                      placeholder={t('signup.fields.passwordPlaceholder')}
                      required
                      className={errors.password ? 'border-red-500' : ''}
                    />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('signup.fields.confirmPassword')}</Label>
                <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={userData.confirmPassword}
                      onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                      placeholder={t('signup.fields.confirmPasswordPlaceholder')}
                      required
                      className={errors.confirmPassword ? 'border-red-500' : ''}
                    />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredLanguage">{t('signup.fields.preferredLanguage')}</Label>
              <select
                id="preferredLanguage"
                value={userData.preferredLanguage}
                onChange={(e) => setUserData({ ...userData, preferredLanguage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-viridial-500"
              >
                <option value="en">{t('signup.languages.en')}</option>
                <option value="fr">{t('signup.languages.fr')}</option>
                <option value="es">{t('signup.languages.es')}</option>
                <option value="de">{t('signup.languages.de')}</option>
              </select>
            </div>

            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {t('signup.buttons.next')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-gray-200 bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('signup.steps.organization.title')}</CardTitle>
            <CardDescription>{t('signup.steps.organization.description')}</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>{t('signup.steps.user.completed')}</span>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleOrganizationStepSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organizationName">{t('signup.fields.organizationName')}</Label>
            <Input
              id="organizationName"
              type="text"
              value={organizationData.name}
              onChange={(e) => {
                setOrganizationData({ ...organizationData, name: e.target.value });
                // Auto-generate slug if empty
                if (!organizationData.slug) {
                  setOrganizationData((prev) => ({
                    ...prev,
                    slug: generateSlug(e.target.value),
                  }));
                }
              }}
              placeholder={t('signup.fields.organizationNamePlaceholder')}
              required
              className={errors.organization?.name ? 'border-red-500' : ''}
            />
            {errors.organization?.name && (
              <p className="text-sm text-red-600">{errors.organization.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationSlug">{t('signup.fields.organizationSlug')}</Label>
              <Input
                id="organizationSlug"
                type="text"
                value={organizationData.slug}
                onChange={(e) => {
                  const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                  setOrganizationData({ ...organizationData, slug });
                }}
                placeholder={t('signup.fields.organizationSlugPlaceholder')}
                required
                className={errors.organization?.slug ? 'border-red-500' : ''}
              />
            {errors.organization?.slug && (
              <p className="text-sm text-red-600">{errors.organization.slug}</p>
            )}
            <p className="text-xs text-gray-500">{t('signup.fields.organizationSlugHelp')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationDescription">{t('signup.fields.organizationDescription')}</Label>
            <textarea
              id="organizationDescription"
              value={organizationData.description}
              onChange={(e) => setOrganizationData({ ...organizationData, description: e.target.value })}
              placeholder={t('signup.fields.organizationDescriptionPlaceholder')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-viridial-500"
            />
            {errors.organization?.description && (
              <p className="text-sm text-red-600">{errors.organization.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizationPlan">{t('signup.fields.organizationPlan')}</Label>
              <select
                id="organizationPlan"
                value={organizationData.plan}
                onChange={(e) =>
                  setOrganizationData({
                    ...organizationData,
                    plan: e.target.value as OrganizationFormData['plan'],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-viridial-500"
              >
                <option value="free">{t('signup.plans.free')}</option>
                <option value="basic">{t('signup.plans.basic')}</option>
                <option value="professional">{t('signup.plans.professional')}</option>
                <option value="enterprise">{t('signup.plans.enterprise')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationIndustry">{t('signup.fields.organizationIndustry')}</Label>
              <Input
                id="organizationIndustry"
                type="text"
                value={organizationData.industry}
                onChange={(e) => setOrganizationData({ ...organizationData, industry: e.target.value })}
                placeholder={t('signup.fields.organizationIndustryPlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizationCountry">{t('signup.fields.organizationCountry')}</Label>
              <Input
                id="organizationCountry"
                type="text"
                value={organizationData.country}
                onChange={(e) => setOrganizationData({ ...organizationData, country: e.target.value })}
                placeholder={t('signup.fields.organizationCountryPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationCity">{t('signup.fields.organizationCity')}</Label>
              <Input
                id="organizationCity"
                type="text"
                value={organizationData.city}
                onChange={(e) => setOrganizationData({ ...organizationData, city: e.target.value })}
                placeholder={t('signup.fields.organizationCityPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationWebsite">{t('signup.fields.organizationWebsite')}</Label>
            <Input
              id="organizationWebsite"
              type="url"
              value={organizationData.website}
              onChange={(e) => setOrganizationData({ ...organizationData, website: e.target.value })}
              placeholder={t('signup.fields.organizationWebsitePlaceholder')}
            />
          </div>

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep('user')}
            disabled={isLoading}
          >
            {t('signup.buttons.back')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('signup.buttons.creating')}
              </>
            ) : (
              t('signup.buttons.create')
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

