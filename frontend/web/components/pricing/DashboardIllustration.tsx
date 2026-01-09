import React from 'react';

export const DashboardIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect width="800" height="600" fill="#F8FAFC" rx="12" />
      
      {/* Header */}
      <rect x="24" y="24" width="752" height="64" fill="white" rx="8" />
      <rect x="44" y="44" width="120" height="24" fill="#E2E8F0" rx="4" />
      <circle cx="720" cy="56" r="16" fill="#E2E8F0" />
      <circle cx="752" cy="56" r="16" fill="#E2E8F0" />
      
      {/* Sidebar */}
      <rect x="24" y="104" width="180" height="472" fill="white" rx="8" />
      <rect x="44" y="128" width="140" height="32" fill="#E2E8F0" rx="4" />
      <rect x="44" y="176" width="140" height="24" fill="#E2E8F0" rx="4" />
      <rect x="44" y="216" width="140" height="24" fill="#3B82F6" rx="4" opacity="0.1" />
      <rect x="44" y="256" width="140" height="24" fill="#E2E8F0" rx="4" />
      <rect x="44" y="296" width="140" height="24" fill="#E2E8F0" rx="4" />
      
      {/* Main Content */}
      <rect x="220" y="104" width="556" height="472" fill="transparent" />
      
      {/* Stats Cards */}
      <rect x="236" y="128" width="168" height="120" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      <circle cx="256" cy="168" r="24" fill="#10B981" opacity="0.1" />
      <path d="M248 156 L256 168 L272 148" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="292" y="160" width="80" height="12" fill="#CBD5E1" rx="2" />
      <rect x="292" y="184" width="40" height="20" fill="#1E293B" rx="2" />
      <rect x="292" y="216" width="100" height="10" fill="#E2E8F0" rx="2" />
      
      <rect x="420" y="128" width="168" height="120" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      <circle cx="440" cy="168" r="24" fill="#3B82F6" opacity="0.1" />
      <circle cx="448" cy="168" r="8" fill="#3B82F6" />
      <rect x="476" y="160" width="80" height="12" fill="#CBD5E1" rx="2" />
      <rect x="476" y="184" width="40" height="20" fill="#1E293B" rx="2" />
      <rect x="476" y="216" width="100" height="10" fill="#E2E8F0" rx="2" />
      
      <rect x="604" y="128" width="168" height="120" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      <circle cx="624" cy="168" r="24" fill="#F59E0B" opacity="0.1" />
      <path d="M632 156 L624 168 L616 156 M624 168 L624 180" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="660" y="160" width="80" height="12" fill="#CBD5E1" rx="2" />
      <rect x="660" y="184" width="40" height="20" fill="#1E293B" rx="2" />
      <rect x="660" y="216" width="100" height="10" fill="#E2E8F0" rx="2" />
      
      {/* Chart */}
      <rect x="236" y="272" width="360" height="240" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="256" y="296" width="100" height="16" fill="#CBD5E1" rx="2" />
      
      {/* Chart Bars */}
      <rect x="280" y="360" width="32" height="120" fill="#3B82F6" rx="4" />
      <rect x="328" y="400" width="32" height="80" fill="#3B82F6" rx="4" />
      <rect x="376" y="340" width="32" height="140" fill="#10B981" rx="4" />
      <rect x="424" y="380" width="32" height="100" fill="#3B82F6" rx="4" />
      <rect x="472" y="420" width="32" height="60" fill="#3B82F6" rx="4" />
      <rect x="520" y="360" width="32" height="120" fill="#10B981" rx="4" />
      
      {/* Recent Activity */}
      <rect x="612" y="272" width="160" height="304" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="632" y="296" width="100" height="16" fill="#CBD5E1" rx="2" />
      
      {/* Activity Items */}
      <circle cx="652" cy="336" r="4" fill="#10B981" />
      <rect x="668" y="328" width="80" height="8" fill="#E2E8F0" rx="2" />
      <rect x="668" y="344" width="60" height="8" fill="#CBD5E1" rx="2" />
      
      <circle cx="652" cy="376" r="4" fill="#3B82F6" />
      <rect x="668" y="368" width="80" height="8" fill="#E2E8F0" rx="2" />
      <rect x="668" y="384" width="60" height="8" fill="#CBD5E1" rx="2" />
      
      <circle cx="652" cy="416" r="4" fill="#F59E0B" />
      <rect x="668" y="408" width="80" height="8" fill="#E2E8F0" rx="2" />
      <rect x="668" y="424" width="60" height="8" fill="#CBD5E1" rx="2" />
    </svg>
  );
};

