'use client';

import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function Header({ title, subtitle, children, actions, className }: HeaderProps) {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const tCommon = useTranslations('common');

  // Get user display name
  const userDisplayName = user?.email?.split('@')[0] || 'User';
  const userInitials = user?.email
    ? user.email
        .split('@')[0]
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <header className={cn('flex-shrink-0 border-b border-gray-200 bg-white z-10 shadow-sm', className)}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {children || (
              <>
                {title && (
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 px-3 gap-2 hover:bg-gray-100 transition-all duration-200 rounded-lg"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-viridial-500 to-viridial-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                    {userInitials}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900 leading-none">
                      {userDisplayName}
                    </span>
                    <span className="text-xs text-gray-500 leading-none mt-0.5">
                      {user?.email || ''}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-2 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-viridial-500 to-viridial-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                      {userInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {userDisplayName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user?.email || ''}
                      </div>
                    </div>
                  </div>
                </div>
                <DropdownMenuItem
                  onClick={() => router.push('/preferences')}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <User className="h-4 w-4 mr-2 text-gray-600" />
                  <span>{tCommon('myPreferences') || 'My Preferences'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push('/settings')}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-2 text-gray-600" />
                  <span>{tCommon('settings') || 'Settings'}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    toast({
                      title: tCommon('loggedOut') || 'Logged out',
                      description: tCommon('loggedOutDescription') || 'You have been successfully logged out.',
                      variant: 'success',
                    });
                  }}
                  className="text-red-600 cursor-pointer hover:bg-red-50 transition-colors focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>{tCommon('logout') || 'Logout'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

