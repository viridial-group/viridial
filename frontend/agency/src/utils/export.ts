import { OrganizationWithStats } from '@/types/organization';

/**
 * Generic export to CSV format
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.csv',
  headers?: string[],
  rowMapper?: (item: T) => any[]
) {
  // If headers and rowMapper are provided, use them
  if (headers && rowMapper) {
    const rows = data.map(rowMapper);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    return;
  }

  // Fallback: Export organizations (backward compatibility)
  const orgData = data as OrganizationWithStats[];
  const orgHeaders = [
    'Name',
    'Slug',
    'Description',
    'Plan',
    'Status',
    'Country',
    'City',
    'Users',
    'Active Users',
    'Max Users',
    'Created At',
  ];

  const rows = orgData.map((org) => [
    org.name,
    org.slug,
    org.description || '',
    org.plan,
    org.isActive ? 'Active' : 'Inactive',
    org.country || '',
    org.city || '',
    org.userCount.toString(),
    org.activeUserCount.toString(),
    org.maxUsers.toString(),
    new Date(org.createdAt).toLocaleDateString(),
  ]);

  const csvContent = [
    orgHeaders.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Generic export to JSON format
 */
export function exportToJSON<T>(data: T[], filename: string = 'export.json') {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Generic export to Excel format (CSV with .xlsx extension)
 * Note: This is a simplified version. For full Excel support, consider using a library like xlsx
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.xlsx',
  headers?: string[],
  rowMapper?: (item: T) => any[]
) {
  // For now, we'll export as CSV but with .xlsx extension
  // This can be opened in Excel, but for full Excel support, use a library like 'xlsx'
  exportToCSV(data, filename.replace('.xlsx', '.csv'), headers, rowMapper);
}


