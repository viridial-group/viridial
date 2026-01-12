'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

interface ResetPasswordModalProps {
  user: {
    id: string;
    email: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: (newPassword: string) => Promise<void>;
}

export function ResetPasswordModal({
  user,
  open,
  onOpenChange,
  onReset,
}: ResetPasswordModalProps) {
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const validate = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      newErrors.password = t('passwordRequired') || 'Password is required';
    } else if (newPassword.length < 8) {
      newErrors.password = t('passwordMinLength') || 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('confirmPasswordRequired') || 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('passwordsDoNotMatch') || 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setError(null);
    try {
      await onReset(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      onOpenChange(false);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('resetPassword') || 'Reset Password'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="text-sm text-gray-600">
            {t('resetPasswordDescription') || `Reset password for ${user.email}`}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">
              {t('newPassword') || 'New Password'} *
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                className={errors.password ? 'border-red-500' : ''}
                placeholder={t('enterNewPassword') || 'Enter new password'}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t('confirmPassword') || 'Confirm Password'} *
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
                className={errors.confirmPassword ? 'border-red-500' : ''}
                placeholder={t('confirmNewPassword') || 'Confirm new password'}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setNewPassword('');
              setConfirmPassword('');
              setErrors({});
            }}
            disabled={isLoading}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleReset}
            disabled={isLoading}
            className="bg-viridial-600 hover:bg-viridial-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {tCommon('saving') || 'Saving...'}
              </>
            ) : (
              t('resetPassword') || 'Reset Password'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

