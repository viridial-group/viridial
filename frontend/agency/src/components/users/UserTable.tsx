'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Role } from '@/types/organization';
import { Mail, User as UserIcon, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface UserTableProps {
  users: User[];
  roles: Role[];
  selectedUserIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onDeleteMultiple?: (userIds: string[]) => void;
}

export function UserTable({
  users,
  roles,
  selectedUserIds: externalSelectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
  onDeleteMultiple,
}: UserTableProps) {
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
  const selectedUserIds = externalSelectedIds ?? internalSelectedIds;

  const handleSelectionChange = (newSelection: Set<string>) => {
    if (externalSelectedIds === undefined) {
      setInternalSelectedIds(newSelection);
    }
    onSelectionChange?.(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? new Set(users.map((u) => u.id)) : new Set<string>();
    handleSelectionChange(newSelection);
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelection = new Set(selectedUserIds);
    if (checked) {
      newSelection.add(userId);
    } else {
      newSelection.delete(userId);
    }
    handleSelectionChange(newSelection);
  };

  const isAllSelected = users.length > 0 && users.every((user) => selectedUserIds.has(user.id));
  const isIndeterminate = users.some((user) => selectedUserIds.has(user.id)) && !isAllSelected;

  const getRoleById = (roleId: string) => {
    return roles.find((r) => r.id === roleId);
  };

  // Helper to get role - supports both roleId (for mock data) and role (from entity)
  const getUserRole = (user: User) => {
    if (user.roleId) {
      return getRoleById(user.roleId);
    }
    // If role is a role name (string), find by name
    return roles.find((r) => r.name === user.role);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('never') || 'Never';
    return format(new Date(dateString), 'dd MMM yyyy HH:mm');
  };

  return (
    <div className="rounded-md">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10">
          <TableRow className="border-b border-gray-200 hover:bg-transparent">
            <TableHead className="w-12 font-semibold text-gray-700">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onCheckedChange={(checked) => handleSelectAll(checked === true)}
              />
            </TableHead>
            <TableHead className="font-semibold text-gray-700">{t('user') || 'User'}</TableHead>
            <TableHead className="font-semibold text-gray-700">{t('email') || 'Email'}</TableHead>
            <TableHead className="font-semibold text-gray-700">{t('role') || 'Role'}</TableHead>
            <TableHead className="font-semibold text-gray-700">{t('status') || 'Status'}</TableHead>
            <TableHead className="font-semibold text-gray-700">{t('lastLogin') || 'Last Login'}</TableHead>
            <TableHead className="text-right font-semibold text-gray-700">{tCommon('actions') || 'Actions'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                {t('noUsersFound') || 'No users found'}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const role = getUserRole(user);
              const isSelected = selectedUserIds.has(user.id);
              return (
                <TableRow
                  key={user.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    isSelected ? 'bg-viridial-50' : ''
                  }`}
                  onClick={(e) => {
                    // Ne pas déclencher la sélection si on clique sur la checkbox ou les boutons d'action
                    if (
                      (e.target as HTMLElement).closest('.checkbox-container') ||
                      (e.target as HTMLElement).closest('button')
                    ) {
                      return;
                    }
                    handleSelectUser(user.id, !isSelected);
                  }}
                >
                  <TableCell className="py-3">
                    <div
                      className="checkbox-container"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked === true)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-viridial-50 border border-viridial-100 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="h-4 w-4 text-viridial-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{user.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm text-gray-700">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {role ? (
                      <Badge variant="secondary" className="text-xs">
                        {role.name}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500">{t('unknownRole') || 'Unknown role'}</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    {user.isActive ? (
                      <Badge variant="success" className="text-xs">
                        {t('active') || 'Active'}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        {t('inactive') || 'Inactive'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-gray-600">
                    {formatDate(user.lastLoginAt)}
                  </TableCell>
                  <TableCell className="text-right py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(user)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(user)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

