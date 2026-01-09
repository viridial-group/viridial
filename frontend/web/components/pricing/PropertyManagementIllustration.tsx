import React from 'react';

export const PropertyManagementIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect width="800" height="600" fill="#F8FAFC" rx="12" />
      
      {/* Header with Search */}
      <rect x="24" y="24" width="752" height="72" fill="white" rx="8" />
      <rect x="44" y="44" width="400" height="40" fill="#F1F5F9" rx="8" />
      <circle cx="424" cy="64" r="12" fill="#64748B" />
      <rect x="472" y="52" width="60" height="24" fill="#E2E8F0" rx="4" />
      <rect x="548" y="52" width="80" height="24" fill="#3B82F6" rx="4" />
      
      {/* Filters */}
      <rect x="24" y="112" width="752" height="56" fill="white" rx="8" />
      <rect x="44" y="128" width="100" height="32" fill="#F1F5F9" rx="4" />
      <rect x="160" y="128" width="100" height="32" fill="#F1F5F9" rx="4" />
      <rect x="276" y="128" width="100" height="32" fill="#F1F5F9" rx="4" />
      <rect x="392" y="128" width="120" height="32" fill="#3B82F6" rx="4" opacity="0.1" />
      
      {/* Property Cards Grid */}
      {/* Card 1 */}
      <rect x="24" y="184" width="240" height="200" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="32" y="192" width="224" height="120" fill="#E2E8F0" rx="4" />
      <rect x="32" y="192" width="224" height="24" fill="#CBD5E1" rx="4" />
      <rect x="32" y="320" width="120" height="16" fill="#1E293B" rx="2" />
      <rect x="32" y="344" width="80" height="12" fill="#64748B" rx="2" />
      <rect x="32" y="364" width="60" height="12" fill="#10B981" rx="2" />
      
      {/* Badges */}
      <rect x="192" y="364" width="64" height="20" fill="#10B981" opacity="0.1" rx="4" />
      <path d="M200 372 L204 380 L216 364" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      
      {/* Card 2 */}
      <rect x="280" y="184" width="240" height="200" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="288" y="192" width="224" height="120" fill="#E2E8F0" rx="4" />
      <rect x="288" y="192" width="224" height="24" fill="#CBD5E1" rx="4" />
      <rect x="288" y="320" width="120" height="16" fill="#1E293B" rx="2" />
      <rect x="288" y="344" width="80" height="12" fill="#64748B" rx="2" />
      <rect x="288" y="364" width="60" height="12" fill="#F59E0B" rx="2" />
      
      {/* Card 3 */}
      <rect x="536" y="184" width="240" height="200" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="544" y="192" width="224" height="120" fill="#E2E8F0" rx="4" />
      <rect x="544" y="192" width="224" height="24" fill="#CBD5E1" rx="4" />
      <rect x="544" y="320" width="120" height="16" fill="#1E293B" rx="2" />
      <rect x="544" y="344" width="80" height="12" fill="#64748B" rx="2" />
      <rect x="544" y="364" width="60" height="12" fill="#EF4444" rx="2" />
      
      {/* Card 4 */}
      <rect x="24" y="400" width="240" height="176" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="32" y="408" width="224" height="120" fill="#E2E8F0" rx="4" />
      <rect x="32" y="408" width="224" height="24" fill="#CBD5E1" rx="4" />
      <rect x="32" y="536" width="120" height="16" fill="#1E293B" rx="2" />
      <rect x="32" y="560" width="80" height="12" fill="#64748B" rx="2" />
      
      {/* Card 5 */}
      <rect x="280" y="400" width="240" height="176" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="288" y="408" width="224" height="120" fill="#E2E8F0" rx="4" />
      <rect x="288" y="408" width="224" height="24" fill="#CBD5E1" rx="4" />
      <rect x="288" y="536" width="120" height="16" fill="#1E293B" rx="2" />
      <rect x="288" y="560" width="80" height="12" fill="#64748B" rx="2" />
      
      {/* Card 6 */}
      <rect x="536" y="400" width="240" height="176" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="544" y="408" width="224" height="120" fill="#E2E8F0" rx="4" />
      <rect x="544" y="408" width="224" height="24" fill="#CBD5E1" rx="4" />
      <rect x="544" y="536" width="120" height="16" fill="#1E293B" rx="2" />
      <rect x="544" y="560" width="80" height="12" fill="#64748B" rx="2" />
      
      {/* Pagination */}
      <rect x="336" y="592" width="128" height="32" fill="white" rx="4" />
      <rect x="344" y="600" width="24" height="16" fill="#E2E8F0" rx="2" />
      <rect x="376" y="600" width="24" height="16" fill="#3B82F6" rx="2" />
      <rect x="408" y="600" width="24" height="16" fill="#E2E8F0" rx="2" />
      <rect x="440" y="600" width="24" height="16" fill="#E2E8F0" rx="2" />
    </svg>
  );
};

