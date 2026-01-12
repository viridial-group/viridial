'use client';

import { useState, useMemo, memo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { OrganizationWithStats } from '@/types/organization';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, Users, CheckCircle2, XCircle, MoreVertical, Edit, Trash2, Eye, MapPin, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export type SortField = 'name' | 'location' | 'plan' | 'status' | 'users' | 'limit' | 'createdAt' | null;
export type SortDirection = 'asc' | 'desc' | null;

interface OrganizationTableProps {
  organizations: OrganizationWithStats[];
  selectedIds?: Set<string>;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  onSelectAll?: (checked: boolean) => void;
  onToggleSelection?: (orgId: string) => void;
  onView?: (org: OrganizationWithStats) => void;
  onEdit?: (org: OrganizationWithStats) => void;
  onDelete?: (org: OrganizationWithStats) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField, direction: SortDirection) => void;
}

export const OrganizationTable = memo(function OrganizationTable({ 
  organizations, 
  selectedIds = new Set(),
  isAllSelected = false,
  isIndeterminate = false,
  onSelectAll,
  onToggleSelection,
  onView, 
  onEdit, 
  onDelete,
  sortField: externalSortField,
  sortDirection: externalSortDirection,
  onSort: externalOnSort
}: OrganizationTableProps) {
  const t = useTranslations();
  const tCommon = useTranslations('common');
  const [internalSortField, setInternalSortField] = useState<SortField>(null);
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(null);
  
  const sortField = externalSortField ?? internalSortField;
  const sortDirection = externalSortDirection ?? internalSortDirection;
  const handleSort = externalOnSort ?? ((field: SortField, direction: SortDirection) => {
    setInternalSortField(field);
    setInternalSortDirection(direction);
  });

  const planColors = {
    free: 'bg-gray-100 text-gray-800',
    basic: 'bg-blue-100 text-blue-800',
    professional: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-viridial-100 text-viridial-800',
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const sortedOrganizations = useMemo(() => {
    if (!sortField || !sortDirection) return organizations;

    const sorted = [...organizations].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'location':
          aValue = `${a.city || ''}, ${a.country || ''}`.toLowerCase();
          bValue = `${b.city || ''}, ${b.country || ''}`.toLowerCase();
          break;
        case 'plan':
          const planOrder = { free: 0, basic: 1, professional: 2, enterprise: 3 };
          aValue = planOrder[a.plan as keyof typeof planOrder] ?? 999;
          bValue = planOrder[b.plan as keyof typeof planOrder] ?? 999;
          break;
        case 'status':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        case 'users':
          aValue = a.userCount;
          bValue = b.userCount;
          break;
        case 'limit':
          aValue = a.maxUsers;
          bValue = b.maxUsers;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [organizations, sortField, sortDirection]);

  const handleColumnSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle: asc -> desc -> null
      if (sortDirection === 'asc') {
        handleSort(field, 'desc');
      } else if (sortDirection === 'desc') {
        handleSort(null, null);
      } else {
        handleSort(field, 'asc');
      }
    } else {
      handleSort(field, 'asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-3.5 w-3.5 text-viridial-600" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-3.5 w-3.5 text-viridial-600" />;
    }
    return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="relative overflow-x-auto bg-gray-50/30">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100/80 border-b border-gray-200 hover:bg-gray-100/80">
              <TableHead className="w-12 border-r border-gray-200">
                {onSelectAll && (
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onCheckedChange={onSelectAll}
                  />
                )}
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleColumnSort('name')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1.5"
                >
                  {t('organizations.organization')}
                  {getSortIcon('name')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleColumnSort('location')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1.5"
                >
                  {t('organizations.location')}
                  {getSortIcon('location')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleColumnSort('plan')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1.5"
                >
                  {t('organizations.plan')}
                  {getSortIcon('plan')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleColumnSort('status')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1.5"
                >
                  {t('organizations.status')}
                  {getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleColumnSort('users')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1.5"
                >
                  {t('organizations.users')}
                  {getSortIcon('users')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleColumnSort('limit')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1.5"
                >
                  {t('organizations.limit')}
                  {getSortIcon('limit')}
                </Button>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleColumnSort('createdAt')}
                  className="h-auto p-0 font-semibold text-gray-700 hover:text-gray-900 hover:bg-transparent gap-1.5"
                >
                  {t('organizations.createdAt')}
                  {getSortIcon('createdAt')}
                </Button>
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-700">{tCommon('actions') || 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrganizations.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="text-center text-gray-500 py-12 bg-white">
                  {t('organizations.noOrganizations')}
                </TableCell>
              </TableRow>
            ) : (
              sortedOrganizations.map((org, index) => (
                <TableRow 
                  key={org.id} 
                  className={`border-b border-gray-200 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  } ${
                    selectedIds.has(org.id) ? 'bg-viridial-50/50 ring-1 ring-viridial-200' : ''
                  } hover:bg-gray-100/70`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TableCell className="py-3 border-r border-gray-200">
                    {onToggleSelection && (
                      <Checkbox
                        checked={selectedIds.has(org.id)}
                        onCheckedChange={() => onToggleSelection(org.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </TableCell>
                  <TableCell className="py-3 border-r border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-viridial-50 rounded-lg border border-viridial-100 flex-shrink-0">
                        <Building2 className="h-4 w-4 text-viridial-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{org.name}</div>
                        <div className="text-xs text-gray-500 truncate">{org.slug}</div>
                        {org.description && (
                          <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                            {org.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 border-r border-gray-200">
                    {(org.country || org.city) && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">
                          {[org.city, org.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-3 border-r border-gray-200">
                    <Badge className={`${planColors[org.plan]} text-xs px-2 py-0.5`}>
                      {t(`organizations.plans.${org.plan}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 border-r border-gray-200">
                    {org.isActive ? (
                      <Badge variant="success" className="gap-1 text-xs px-2 py-0.5">
                        <CheckCircle2 className="h-3 w-3" />
                        {tCommon('active') || 'Active'}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1 text-xs px-2 py-0.5">
                        <XCircle className="h-3 w-3" />
                        {tCommon('inactive') || 'Inactive'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-3 border-r border-gray-200">
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span>{org.activeUserCount}/{org.userCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-gray-600 border-r border-gray-200">
                    {org.maxUsers}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-gray-600 border-r border-gray-200">
                    {formatDate(org.createdAt)}
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <div className="flex items-center justify-end gap-1">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onView(org)}
                          className="h-8 w-8"
                          title={tCommon('view') || 'View'}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(org)}
                          className="h-8 w-8"
                          title={tCommon('edit') || 'Edit'}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(org)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title={tCommon('delete') || 'Delete'}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo to prevent unnecessary re-renders
  // Only re-render if organizations array reference changes, selections change, or sort changes
  const organizationsChanged = 
    prevProps.organizations.length !== nextProps.organizations.length ||
    prevProps.organizations.some((org, idx) => {
      const nextOrg = nextProps.organizations[idx];
      return !nextOrg || org.id !== nextOrg.id || org.updatedAt !== nextOrg.updatedAt;
    });

  // Handle optional selectedIds prop
  const prevSelectedIds = prevProps.selectedIds || new Set();
  const nextSelectedIds = nextProps.selectedIds || new Set();
  const selectionsChanged = 
    prevSelectedIds.size !== nextSelectedIds.size ||
    Array.from(prevSelectedIds).some(id => !nextSelectedIds.has(id));

  const sortChanged = 
    prevProps.sortField !== nextProps.sortField ||
    prevProps.sortDirection !== nextProps.sortDirection;

  return !organizationsChanged && !selectionsChanged && !sortChanged &&
    prevProps.isAllSelected === nextProps.isAllSelected &&
    prevProps.isIndeterminate === nextProps.isIndeterminate;
});

