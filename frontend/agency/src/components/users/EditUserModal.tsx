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
import { Switch } from '@/components/ui/switch';
import { User, Mail, Edit, AlertCircle } from 'lucide-react';
import { UpdateUserDto, User as UserType } from '@/lib/user-api';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface EditUserModalProps {
  user: UserType;
  organizations: Organization[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: UpdateUserDto) => void;
}

export function EditUserModal({
  user,
  organizations,
  open,
  onOpenChange,
  onUpdate,
}: EditUserModalProps) {
  const t = useTranslations('users');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<UpdateUserDto>({
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    preferredLanguage: user.preferredLanguage || 'en',
    role: user.role || 'user',
    isActive: user.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && user) {
      setFormData({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        preferredLanguage: user.preferredLanguage || 'en',
        role: user.role || 'user',
        isActive: user.isActive ?? true,
      });
      setErrors({});
    }
  }, [open, user]);

  const validateEmail = (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = t('invalidEmail') || 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdate(formData);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-viridial-600" />
            {t('editUser') || 'Edit User'}
          </DialogTitle>
          <DialogDescription>
            {t('editUserDescription') || 'Update user information'}
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

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="space-y-0.5">
              <Label className="text-base">{t('status')}</Label>
              <p className="text-sm text-gray-500">
                {t('activeStatusDescription') || 'Active users can log in and use the system'}
              </p>
            </div>
            <Switch
              checked={formData.isActive ?? true}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {tCommon('cancel') || 'Cancel'}
            </Button>
            <Button type="submit" className="bg-viridial-600 hover:bg-viridial-700 text-white">
              {tCommon('save') || 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

