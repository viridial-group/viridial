'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Mail, UserPlus, AlertCircle } from 'lucide-react';
import { CreateUserDto } from '@/lib/user-api';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface CreateUserModalProps {
  organizations: Organization[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: CreateUserDto) => void;
}

export function CreateUserModal({
  organizations,
  open,
  onOpenChange,
  onCreate,
}: CreateUserModalProps) {
  const t = useTranslations('users');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    preferredLanguage: 'en',
    role: 'user',
    organizationId: organizations.length > 0 ? organizations[0].id : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        preferredLanguage: 'en',
        role: 'user',
        organizationId: organizations.length > 0 ? organizations[0].id : '',
      });
      setErrors({});
    }
  }, [open, organizations]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = t('invalidEmail') || 'Please enter a valid email address';
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = t('passwordMinLength') || 'Password must be at least 8 characters';
    }

    if (!formData.organizationId) {
      newErrors.organizationId = t('organizationRequired') || 'Organization is required';
    }

    if (!formData.role) {
      newErrors.role = t('roleRequired') || 'Role is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onCreate(formData);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-viridial-600" />
            {t('createUser') || 'Create User'}
          </DialogTitle>
          <DialogDescription>
            {t('createUserDescription') || 'Create a new user account in the system'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              {t('email')} *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                required
                placeholder="user@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {t('password')} *
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              className={errors.password ? 'border-red-500' : ''}
              required
              minLength={8}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {t('passwordMinLengthHint') || 'Password must be at least 8 characters long'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {t('firstName')}
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder={t('firstNamePlaceholder') || 'John'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                {t('lastName')}
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder={t('lastNamePlaceholder') || 'Doe'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                {t('phone')}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('phonePlaceholder') || '+1 234 567 8900'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredLanguage">
                {t('preferredLanguage') || 'Preferred Language'}
              </Label>
              <Select
                value={formData.preferredLanguage || 'en'}
                onValueChange={(value) => setFormData({ ...formData, preferredLanguage: value })}
              >
                <SelectTrigger id="preferredLanguage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizationId">
                {t('organization')} *
              </Label>
              <Select
                value={formData.organizationId}
                onValueChange={(value) => {
                  setFormData({ ...formData, organizationId: value });
                  if (errors.organizationId) setErrors({ ...errors, organizationId: '' });
                }}
              >
                <SelectTrigger id="organizationId" className={errors.organizationId ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('selectOrganization') || 'Select organization'} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.organizationId && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.organizationId}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                {t('role')} *
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => {
                  setFormData({ ...formData, role: value });
                  if (errors.role) setErrors({ ...errors, role: '' });
                }}
              >
                <SelectTrigger id="role" className={errors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('selectRole') || 'Select role'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{t('roleUser') || 'User'}</SelectItem>
                  <SelectItem value="admin">{t('roleAdmin') || 'Admin'}</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.role}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {tCommon('cancel') || 'Cancel'}
            </Button>
            <Button type="submit" className="bg-viridial-600 hover:bg-viridial-700 text-white">
              {tCommon('create') || 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

