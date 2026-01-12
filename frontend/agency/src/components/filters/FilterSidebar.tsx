'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  X, 
  Plus,
  RotateCcw 
} from 'lucide-react';

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  plan: string;
  status: string;
  minUsers: string;
  maxUsers: string;
}

export function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    plan: 'all',
    status: 'all',
    minUsers: '',
    maxUsers: '',
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update active filters chips
    const newActiveFilters: string[] = [];
    if (newFilters.plan !== 'all') newActiveFilters.push(`Plan: ${newFilters.plan}`);
    if (newFilters.status !== 'all') newActiveFilters.push(`Status: ${newFilters.status}`);
    if (newFilters.minUsers) newActiveFilters.push(`Min users: ${newFilters.minUsers}`);
    if (newFilters.maxUsers) newActiveFilters.push(`Max users: ${newFilters.maxUsers}`);
    setActiveFilters(newActiveFilters);
    
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      search: '',
      plan: 'all',
      status: 'all',
      minUsers: '',
      maxUsers: '',
    };
    setFilters(resetFilters);
    setActiveFilters([]);
    onFilterChange?.(resetFilters);
  };

  const removeFilter = (filterToRemove: string) => {
    const [key, value] = filterToRemove.split(': ');
    if (key === 'Plan') {
      handleFilterChange('plan', 'all');
    } else if (key === 'Status') {
      handleFilterChange('status', 'all');
    } else if (key === 'Min users') {
      handleFilterChange('minUsers', '');
    } else if (key === 'Max users') {
      handleFilterChange('maxUsers', '');
    }
  };

  return (
    <div className="w-80 border-r border-gray-200 bg-white h-screen overflow-y-auto sticky top-0">
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Filtres</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs h-7 px-2 text-gray-600 hover:text-gray-900"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>

        {/* Active Filters Chips */}
        {activeFilters.length > 0 && (
          <div className="space-y-2 pb-3 border-b border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Filtres actifs</div>
            <div className="flex flex-wrap gap-1.5">
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer gap-1 text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 border-gray-200"
                  onClick={() => removeFilter(filter)}
                >
                  {filter}
                  <X className="h-2.5 w-2.5" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Recherche</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une organisation..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9 h-9 text-sm border-gray-200 focus:border-viridial-400 focus:ring-viridial-400"
            />
          </div>
        </div>

        {/* Plan Filter */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Plan</label>
          <Select
            value={filters.plan}
            onValueChange={(value) => handleFilterChange('plan', value)}
          >
            <SelectTrigger className="h-9 text-sm border-gray-200">
              <SelectValue placeholder="Tous les plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Statut</label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="h-9 text-sm border-gray-200">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Range */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Nombre d'utilisateurs</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Min"
                value={filters.minUsers}
                onChange={(e) => handleFilterChange('minUsers', e.target.value)}
                className="h-9 text-sm border-gray-200"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxUsers}
                onChange={(e) => handleFilterChange('maxUsers', e.target.value)}
                className="h-9 text-sm border-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Create Template Button */}
        <Button variant="outline" className="w-full gap-2 h-9 text-sm border-gray-300 hover:bg-gray-50">
          <Plus className="h-3.5 w-3.5" />
          Créer un modèle de recherche
        </Button>
      </div>
    </div>
  );
}

