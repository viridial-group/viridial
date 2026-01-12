'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
  Building2,
  Users,
  Shield,
  Settings,
  ChevronRight,
  ChevronDown,
  Home,
  BarChart3,
  FileText,
  HelpCircle,
  Folder,
  UserCog,
  CreditCard,
  Key,
  Sparkles,
  Building,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

// Menu items will be generated dynamically using translations

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['organizations', 'rbac', 'admin', 'properties']);

  // Extract organization ID from pathname if we're on an organization page
  const organizationIdMatch = pathname.match(/\/organizations\/([^\/]+)/);
  const organizationId = organizationIdMatch ? organizationIdMatch[1] : null;
  const isOnOrganizationPage = !!organizationId;

  // Build organizations children menu
  const organizationsChildren: MenuItem[] = [
    {
      id: 'all-organizations',
      label: t('navigation.organizations'),
      icon: <Building2 className="h-3.5 w-3.5" />,
      path: '/',
    },
    {
      id: 'user-management',
      label: t('navigation.users') || 'User Management',
      icon: <Users className="h-3.5 w-3.5" />,
      path: '/users',
    },
  ];



  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: t('navigation.dashboard'),
      icon: <Home className="h-4 w-4" />,
      path: '/',
    },
    {
      id: 'organizations',
      label: t('navigation.organizations'),
      icon: <Building2 className="h-4 w-4" />,
      path: '/',
      children: organizationsChildren,
    },
    {
      id: 'properties',
      label: t('navigation.properties') || 'Properties',
      icon: <Building className="h-4 w-4" />,
      path: '/properties',
    },
    {
      id: 'rbac',
      label: t('navigation.rbacManagement'),
      icon: <Shield className="h-4 w-4" />,
      children: [
        {
          id: 'resources',
          label: t('navigation.resources'),
          icon: <Folder className="h-3.5 w-3.5" />,
          path: '/admin/resources',
        },
        {
          id: 'permissions',
          label: t('navigation.permissions'),
          icon: <Key className="h-3.5 w-3.5" />,
          path: '/admin/permissions',
        },
        {
          id: 'features',
          label: t('navigation.features'),
          icon: <Sparkles className="h-3.5 w-3.5" />,
          path: '/admin/features',
        },
        {
          id: 'roles',
          label: t('navigation.roles'),
          icon: <Shield className="h-3.5 w-3.5" />,
          path: '/roles',
        },
      ],
    },
    {
      id: 'analytics',
      label: t('navigation.analytics'),
      icon: <BarChart3 className="h-4 w-4" />,
      path: '/analytics',
    },
    {
      id: 'admin',
      label: t('navigation.admin'),
      icon: <UserCog className="h-4 w-4" />,
      children: [
        {
          id: 'plans',
          label: t('navigation.plansManagement'),
          icon: <CreditCard className="h-3.5 w-3.5" />,
          path: '/admin/plans',
        },
      ],
    },
    {
      id: 'settings',
      label: t('navigation.settings'),
      icon: <Settings className="h-4 w-4" />,
      children: [
        {
          id: 'general',
          label: t('navigation.settings'),
          icon: <Settings className="h-3.5 w-3.5" />,
          path: '/settings/general',
        },
      ],
    },
    {
      id: 'help',
      label: t('navigation.help'),
      icon: <HelpCircle className="h-4 w-4" />,
      path: '/help',
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const hasActiveChild = (item: MenuItem): boolean => {
    if (!item.children) return false;
    return item.children.some((child) => isActive(child.path));
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    }
    if (item.path) {
      router.push(item.path);
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const itemIsActive = isActive(item.path) || hasActiveChild(item);

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
            'hover:bg-gray-100',
            level === 0 && 'mb-1',
            itemIsActive && 'bg-viridial-50 text-viridial-700',
            !itemIsActive && 'text-gray-700',
            level > 0 && 'ml-4 text-xs'
          )}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className={cn(
              'flex-shrink-0',
              level > 0 && 'text-gray-500'
            )}>
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </div>
          {hasChildren && (
            <span className="flex-shrink-0 ml-2">
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              )}
            </span>
          )}
        </button>
        {hasChildren && isExpanded && item.children && (
          <div className="mt-1 space-y-0.5">
            {item.children.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn(
      'w-64 border-r border-gray-200 bg-white h-screen overflow-y-auto sticky top-0 flex flex-col',
      className
    )}>
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-viridial-500 rounded-lg">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Viridial Agency</h2>
            <p className="text-xs text-gray-500">Gestion</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-2">Version 0.1.0</div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Besoin d'aide ?</span>
        </div>
      </div>
    </aside>
  );
}

