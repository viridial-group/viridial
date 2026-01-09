import React from 'react';

/**
 * Dashboard Backoffice Illustration
 * Represents a modern SaaS dashboard with metrics, charts, and activity feed
 */
export const DashboardBackofficeSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 600 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect width="600" height="400" fill="#F9FAFB" rx="8" />
      
      {/* Top Navigation */}
      <rect x="16" y="16" width="568" height="48" fill="white" rx="6" />
      <rect x="32" y="32" width="100" height="16" fill="#E5E7EB" rx="3" />
      <circle cx="540" cy="40" r="12" fill="#E5E7EB" />
      <circle cx="568" cy="40" r="12" fill="#E5E7EB" />
      
      {/* Sidebar */}
      <rect x="16" y="80" width="120" height="304" fill="white" rx="6" />
      <rect x="32" y="96" width="88" height="20" fill="#0d9488" opacity="0.1" rx="3" />
      <rect x="32" y="128" width="88" height="16" fill="#E5E7EB" rx="2" />
      <rect x="32" y="152" width="88" height="16" fill="#E5E7EB" rx="2" />
      <rect x="32" y="176" width="88" height="16" fill="#E5E7EB" rx="2" />
      
      {/* Main Content Area */}
      <rect x="152" y="80" width="432" height="304" fill="transparent" />
      
      {/* Stats Cards Row */}
      <rect x="168" y="96" width="128" height="88" fill="white" rx="6" stroke="#E5E7EB" strokeWidth="1" />
      <circle cx="192" cy="128" r="20" fill="#0d9488" opacity="0.1" />
      <path d="M184 120 L192 128 L200 120" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="224" y="120" width="56" height="10" fill="#9CA3AF" rx="2" />
      <rect x="224" y="140" width="40" height="16" fill="#111827" rx="2" />
      <rect x="224" y="164" width="64" height="8" fill="#E5E7EB" rx="2" />
      
      <rect x="312" y="96" width="128" height="88" fill="white" rx="6" stroke="#E5E7EB" strokeWidth="1" />
      <circle cx="336" cy="128" r="20" fill="#3B82F6" opacity="0.1" />
      <circle cx="344" cy="128" r="6" fill="#3B82F6" />
      <rect x="368" y="120" width="56" height="10" fill="#9CA3AF" rx="2" />
      <rect x="368" y="140" width="40" height="16" fill="#111827" rx="2" />
      <rect x="368" y="164" width="64" height="8" fill="#E5E7EB" rx="2" />
      
      <rect x="456" y="96" width="128" height="88" fill="white" rx="6" stroke="#E5E7EB" strokeWidth="1" />
      <circle cx="480" cy="128" r="20" fill="#F59E0B" opacity="0.1" />
      <path d="M488 120 L480 128 L472 120 M480 128 L480 140" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="512" y="120" width="56" height="10" fill="#9CA3AF" rx="2" />
      <rect x="512" y="140" width="40" height="16" fill="#111827" rx="2" />
      <rect x="512" y="164" width="64" height="8" fill="#E5E7EB" rx="2" />
      
      {/* Chart Section */}
      <rect x="168" y="200" width="280" height="176" fill="white" rx="6" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="184" y="216" width="80" height="12" fill="#9CA3AF" rx="2" />
      
      {/* Chart Bars */}
      <rect x="200" y="280" width="24" height="72" fill="#0d9488" rx="3" />
      <rect x="240" y="300" width="24" height="52" fill="#3B82F6" rx="3" />
      <rect x="280" y="260" width="24" height="92" fill="#0d9488" rx="3" />
      <rect x="320" y="320" width="24" height="32" fill="#3B82F6" rx="3" />
      <rect x="360" y="280" width="24" height="72" fill="#0d9488" rx="3" />
      <rect x="400" y="290" width="24" height="62" fill="#3B82F6" rx="3" />
      
      {/* Activity Feed */}
      <rect x="464" y="200" width="120" height="176" fill="white" rx="6" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="480" y="216" width="72" height="12" fill="#9CA3AF" rx="2" />
      
      {/* Activity Items */}
      <circle cx="496" cy="248" r="4" fill="#0d9488" />
      <rect x="512" y="242" width="56" height="6" fill="#E5E7EB" rx="2" />
      <rect x="512" y="254" width="40" height="6" fill="#D1D5DB" rx="2" />
      
      <circle cx="496" cy="280" r="4" fill="#3B82F6" />
      <rect x="512" y="274" width="56" height="6" fill="#E5E7EB" rx="2" />
      <rect x="512" y="286" width="40" height="6" fill="#D1D5DB" rx="2" />
      
      <circle cx="496" cy="312" r="4" fill="#F59E0B" />
      <rect x="512" y="306" width="56" height="6" fill="#E5E7EB" rx="2" />
      <rect x="512" y="318" width="40" height="6" fill="#D1D5DB" rx="2" />
    </svg>
  );
};

/**
 * Property Management Backoffice Illustration
 * Shows a property listing table with actions and filters
 */
export const PropertyManagementBackofficeSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 600 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect width="600" height="400" fill="#F9FAFB" rx="8" />
      
      {/* Header */}
      <rect x="16" y="16" width="568" height="56" fill="white" rx="6" />
      <rect x="32" y="32" width="120" height="24" fill="#111827" rx="3" />
      <rect x="440" y="36" width="100" height="16" fill="#0d9488" rx="4" />
      
      {/* Filters Bar */}
      <rect x="16" y="88" width="568" height="40" fill="white" rx="6" />
      <rect x="32" y="100" width="80" height="16" fill="#E5E7EB" rx="3" />
      <rect x="128" y="100" width="80" height="16" fill="#E5E7EB" rx="3" />
      <rect x="224" y="100" width="80" height="16" fill="#0d9488" opacity="0.1" rx="3" />
      <circle cx="480" cy="108" r="12" fill="#E5E7EB" />
      
      {/* Table */}
      <rect x="16" y="144" width="568" height="240" fill="white" rx="6" />
      
      {/* Table Header */}
      <rect x="32" y="160" width="520" height="24" fill="#F9FAFB" rx="3" />
      <rect x="40" y="164" width="60" height="16" fill="#9CA3AF" rx="2" />
      <rect x="120" y="164" width="80" height="16" fill="#9CA3AF" rx="2" />
      <rect x="220" y="164" width="80" height="16" fill="#9CA3AF" rx="2" />
      <rect x="320" y="164" width="60" height="16" fill="#9CA3AF" rx="2" />
      <rect x="400" y="164" width="60" height="16" fill="#9CA3AF" rx="2" />
      <rect x="480" y="164" width="60" height="16" fill="#9CA3AF" rx="2" />
      
      {/* Table Rows */}
      {/* Row 1 */}
      <rect x="40" y="200" width="48" height="32" fill="#E5E7EB" rx="3" />
      <rect x="100" y="204" width="100" height="12" fill="#111827" rx="2" />
      <rect x="100" y="220" width="80" height="8" fill="#9CA3AF" rx="2" />
      <rect x="220" y="208" width="60" height="16" fill="#0d9488" opacity="0.1" rx="3" />
      <rect x="220" y="208" width="40" height="8" fill="#0d9488" rx="2" />
      <rect x="300" y="208" width="50" height="12" fill="#111827" rx="2" />
      <rect x="370" y="208" width="40" height="12" fill="#111827" rx="2" />
      <circle cx="480" cy="216" r="8" fill="#E5E7EB" />
      <circle cx="500" cy="216" r="8" fill="#E5E7EB" />
      
      {/* Row 2 */}
      <rect x="40" y="248" width="48" height="32" fill="#E5E7EB" rx="3" />
      <rect x="100" y="252" width="100" height="12" fill="#111827" rx="2" />
      <rect x="100" y="268" width="80" height="8" fill="#9CA3AF" rx="2" />
      <rect x="220" y="256" width="60" height="16" fill="#3B82F6" opacity="0.1" rx="3" />
      <rect x="220" y="256" width="40" height="8" fill="#3B82F6" rx="2" />
      <rect x="300" y="256" width="50" height="12" fill="#111827" rx="2" />
      <rect x="370" y="256" width="40" height="12" fill="#111827" rx="2" />
      <circle cx="480" cy="264" r="8" fill="#E5E7EB" />
      <circle cx="500" cy="264" r="8" fill="#E5E7EB" />
      
      {/* Row 3 */}
      <rect x="40" y="296" width="48" height="32" fill="#E5E7EB" rx="3" />
      <rect x="100" y="300" width="100" height="12" fill="#111827" rx="2" />
      <rect x="100" y="316" width="80" height="8" fill="#9CA3AF" rx="2" />
      <rect x="220" y="304" width="60" height="16" fill="#F59E0B" opacity="0.1" rx="3" />
      <rect x="220" y="304" width="40" height="8" fill="#F59E0B" rx="2" />
      <rect x="300" y="304" width="50" height="12" fill="#111827" rx="2" />
      <rect x="370" y="304" width="40" height="12" fill="#111827" rx="2" />
      <circle cx="480" cy="312" r="8" fill="#E5E7EB" />
      <circle cx="500" cy="312" r="8" fill="#E5E7EB" />
      
      {/* Pagination */}
      <rect x="240" y="352" width="120" height="24" fill="#F9FAFB" rx="4" />
      <rect x="252" y="360" width="16" height="8" fill="#9CA3AF" rx="2" />
      <rect x="276" y="360" width="16" height="8" fill="#0d9488" rx="2" />
      <rect x="300" y="360" width="16" height="8" fill="#9CA3AF" rx="2" />
      <rect x="324" y="360" width="16" height="8" fill="#9CA3AF" rx="2" />
    </svg>
  );
};

/**
 * Analytics Backoffice Illustration
 * Shows charts, graphs, and data visualization
 */
export const AnalyticsBackofficeSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 600 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect width="600" height="400" fill="#F9FAFB" rx="8" />
      
      {/* Header */}
      <rect x="16" y="16" width="568" height="48" fill="white" rx="6" />
      <rect x="32" y="32" width="100" height="16" fill="#111827" rx="3" />
      <rect x="440" y="36" width="80" height="16" fill="#E5E7EB" rx="3" />
      
      {/* Main Chart */}
      <rect x="16" y="80" width="360" height="200" fill="white" rx="6" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="32" y="96" width="120" height="16" fill="#111827" rx="2" />
      <rect x="32" y="120" width="80" height="12" fill="#9CA3AF" rx="2" />
      
      {/* Line Chart */}
      <path
        d="M 56 240 L 96 200 L 136 180 L 176 160 L 216 140 L 256 150 L 296 130 L 336 120"
        stroke="#0d9488"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 56 240 L 96 200 L 136 180 L 176 160 L 216 140 L 256 150 L 296 130 L 336 120 L 336 240 L 56 240 Z"
        fill="#0d9488"
        opacity="0.1"
      />
      
      {/* Data Points */}
      <circle cx="56" cy="240" r="4" fill="#0d9488" />
      <circle cx="96" cy="200" r="4" fill="#0d9488" />
      <circle cx="136" cy="180" r="4" fill="#0d9488" />
      <circle cx="176" cy="160" r="4" fill="#0d9488" />
      <circle cx="216" cy="140" r="4" fill="#0d9488" />
      <circle cx="256" cy="150" r="4" fill="#0d9488" />
      <circle cx="296" cy="130" r="4" fill="#0d9488" />
      <circle cx="336" cy="120" r="4" fill="#0d9488" />
      
      {/* Secondary Chart - Pie */}
      <rect x="392" y="80" width="192" height="200" fill="white" rx="6" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="408" y="96" width="100" height="16" fill="#111827" rx="2" />
      
      {/* Pie Chart Slices */}
      <path
        d="M 488 180 L 488 140 A 40 40 0 0 1 520 160 Z"
        fill="#0d9488"
      />
      <path
        d="M 520 160 A 40 40 0 0 1 520 200 L 488 180 Z"
        fill="#3B82F6"
      />
      <path
        d="M 520 200 A 40 40 0 0 1 488 220 L 488 180 Z"
        fill="#F59E0B"
      />
      <path
        d="M 488 220 A 40 40 0 0 1 488 180 L 488 180 Z"
        fill="#8B5CF6"
      />
      
      {/* Legend */}
      <rect x="408" y="240" width="160" height="24" fill="transparent" />
      <circle cx="416" cy="252" r="4" fill="#0d9488" />
      <rect x="428" y="248" width="40" height="8" fill="#9CA3AF" rx="2" />
      <circle cx="480" cy="252" r="4" fill="#3B82F6" />
      <rect x="492" y="248" width="40" height="8" fill="#9CA3AF" rx="2" />
      <circle cx="544" cy="252" r="4" fill="#F59E0B" />
      <rect x="556" y="248" width="40" height="8" fill="#9CA3AF" rx="2" />
      
      {/* Stats Grid */}
      <rect x="16" y="296" width="568" height="88" fill="white" rx="6" />
      
      {/* Stat Cards */}
      <rect x="32" y="312" width="128" height="56" fill="#F9FAFB" rx="4" />
      <rect x="48" y="320" width="80" height="10" fill="#9CA3AF" rx="2" />
      <rect x="48" y="340" width="60" height="16" fill="#111827" rx="2" />
      <rect x="48" y="360" width="96" height="8" fill="#E5E7EB" rx="2" />
      
      <rect x="176" y="312" width="128" height="56" fill="#F9FAFB" rx="4" />
      <rect x="192" y="320" width="80" height="10" fill="#9CA3AF" rx="2" />
      <rect x="192" y="340" width="60" height="16" fill="#111827" rx="2" />
      <rect x="192" y="360" width="96" height="8" fill="#E5E7EB" rx="2" />
      
      <rect x="320" y="312" width="128" height="56" fill="#F9FAFB" rx="4" />
      <rect x="336" y="320" width="80" height="10" fill="#9CA3AF" rx="2" />
      <rect x="336" y="340" width="60" height="16" fill="#111827" rx="2" />
      <rect x="336" y="360" width="96" height="8" fill="#E5E7EB" rx="2" />
      
      <rect x="464" y="312" width="104" height="56" fill="#F9FAFB" rx="4" />
      <rect x="480" y="320" width="64" height="10" fill="#9CA3AF" rx="2" />
      <rect x="480" y="340" width="60" height="16" fill="#111827" rx="2" />
      <rect x="480" y="360" width="72" height="8" fill="#E5E7EB" rx="2" />
    </svg>
  );
};

/**
 * Lead Management Backoffice Illustration
 * Shows a CRM-style interface with lead cards and pipeline
 */
export const LeadManagementBackofficeSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 600 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect width="600" height="400" fill="#F9FAFB" rx="8" />
      
      {/* Header */}
      <rect x="16" y="16" width="568" height="48" fill="white" rx="6" />
      <rect x="32" y="32" width="120" height="16" fill="#111827" rx="3" />
      <rect x="440" y="36" width="100" height="16" fill="#0d9488" rx="4" />
      
      {/* Pipeline Columns */}
      <rect x="16" y="80" width="568" height="304" fill="transparent" />
      
      {/* Column 1 - New */}
      <rect x="24" y="88" width="128" height="288" fill="white" rx="6" />
      <rect x="40" y="104" width="80" height="16" fill="#9CA3AF" rx="2" />
      <rect x="40" y="128" width="8" height="8" fill="#9CA3AF" rx="1" />
      <rect x="56" y="128" width="88" height="12" fill="#111827" rx="2" />
      
      {/* Lead Card 1 */}
      <rect x="40" y="152" width="96" height="80" fill="#F9FAFB" rx="4" stroke="#E5E7EB" strokeWidth="1" />
      <circle cx="64" cy="172" r="16" fill="#0d9488" opacity="0.1" />
      <circle cx="64" cy="172" r="8" fill="#0d9488" />
      <rect x="88" y="168" width="40" height="10" fill="#111827" rx="2" />
      <rect x="88" y="184" width="32" height="8" fill="#9CA3AF" rx="2" />
      <rect x="48" y="204" width="80" height="8" fill="#E5E7EB" rx="2" />
      <rect x="48" y="220" width="60" height="8" fill="#E5E7EB" rx="2" />
      
      {/* Lead Card 2 */}
      <rect x="40" y="248" width="96" height="80" fill="#F9FAFB" rx="4" stroke="#E5E7EB" strokeWidth="1" />
      <circle cx="64" cy="268" r="16" fill="#3B82F6" opacity="0.1" />
      <circle cx="64" cy="268" r="8" fill="#3B82F6" />
      <rect x="88" y="264" width="40" height="10" fill="#111827" rx="2" />
      <rect x="88" y="280" width="32" height="8" fill="#9CA3AF" rx="2" />
      <rect x="48" y="300" width="80" height="8" fill="#E5E7EB" rx="2" />
      <rect x="48" y="316" width="60" height="8" fill="#E5E7EB" rx="2" />
      
      {/* Column 2 - Contacted */}
      <rect x="168" y="88" width="128" height="288" fill="white" rx="6" />
      <rect x="184" y="104" width="80" height="16" fill="#9CA3AF" rx="2" />
      <rect x="184" y="128" width="8" height="8" fill="#9CA3AF" rx="1" />
      <rect x="200" y="128" width="88" height="12" fill="#111827" rx="2" />
      
      {/* Lead Card */}
      <rect x="184" y="152" width="96" height="80" fill="#F9FAFB" rx="4" stroke="#E5E7EB" strokeWidth="1" />
      <circle cx="208" cy="172" r="16" fill="#F59E0B" opacity="0.1" />
      <circle cx="208" cy="172" r="8" fill="#F59E0B" />
      <rect x="232" y="168" width="40" height="10" fill="#111827" rx="2" />
      <rect x="232" y="184" width="32" height="8" fill="#9CA3AF" rx="2" />
      <rect x="192" y="204" width="80" height="8" fill="#E5E7EB" rx="2" />
      <rect x="192" y="220" width="60" height="8" fill="#E5E7EB" rx="2" />
      
      {/* Column 3 - Qualified */}
      <rect x="312" y="88" width="128" height="288" fill="white" rx="6" />
      <rect x="328" y="104" width="80" height="16" fill="#9CA3AF" rx="2" />
      <rect x="328" y="128" width="8" height="8" fill="#9CA3AF" rx="1" />
      <rect x="344" y="128" width="88" height="12" fill="#111827" rx="2" />
      
      {/* Lead Card */}
      <rect x="328" y="152" width="96" height="80" fill="#F9FAFB" rx="4" stroke="#E5E7EB" strokeWidth="1" />
      <circle cx="352" cy="172" r="16" fill="#0d9488" opacity="0.1" />
      <circle cx="352" cy="172" r="8" fill="#0d9488" />
      <rect x="376" y="168" width="40" height="10" fill="#111827" rx="2" />
      <rect x="376" y="184" width="32" height="8" fill="#9CA3AF" rx="2" />
      <rect x="336" y="204" width="80" height="8" fill="#E5E7EB" rx="2" />
      <rect x="336" y="220" width="60" height="8" fill="#E5E7EB" rx="2" />
      
      {/* Column 4 - Converted */}
      <rect x="456" y="88" width="128" height="288" fill="white" rx="6" />
      <rect x="472" y="104" width="80" height="16" fill="#9CA3AF" rx="2" />
      <rect x="472" y="128" width="8" height="8" fill="#9CA3AF" rx="1" />
      <rect x="488" y="128" width="88" height="12" fill="#111827" rx="2" />
      
      {/* Lead Card */}
      <rect x="472" y="152" width="96" height="80" fill="#F9FAFB" rx="4" stroke="#E5E7EB" strokeWidth="1" />
      <circle cx="496" cy="172" r="16" fill="#10B981" opacity="0.1" />
      <path d="M488 168 L496 176 L504 168" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="520" y="168" width="40" height="10" fill="#111827" rx="2" />
      <rect x="520" y="184" width="32" height="8" fill="#9CA3AF" rx="2" />
      <rect x="480" y="204" width="80" height="8" fill="#E5E7EB" rx="2" />
      <rect x="480" y="220" width="60" height="8" fill="#E5E7EB" rx="2" />
    </svg>
  );
};

/**
 * Search Interface Backoffice Illustration
 * Shows search filters, results, and map view
 */
export const SearchBackofficeSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 600 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect width="600" height="400" fill="#F9FAFB" rx="8" />
      
      {/* Search Bar */}
      <rect x="16" y="16" width="568" height="48" fill="white" rx="6" />
      <circle cx="48" cy="40" r="12" fill="#E5E7EB" />
      <rect x="72" y="32" width="200" height="16" fill="#E5E7EB" rx="2" />
      <rect x="440" y="36" width="80" height="16" fill="#0d9488" rx="4" />
      
      {/* Filters */}
      <rect x="16" y="80" width="568" height="40" fill="white" rx="6" />
      <rect x="32" y="92" width="60" height="16" fill="#0d9488" opacity="0.1" rx="3" />
      <rect x="32" y="92" width="40" height="8" fill="#0d9488" rx="2" />
      <rect x="108" y="92" width="60" height="16" fill="#E5E7EB" rx="3" />
      <rect x="184" y="92" width="60" height="16" fill="#E5E7EB" rx="3" />
      <rect x="260" y="92" width="60" height="16" fill="#E5E7EB" rx="3" />
      <circle cx="480" cy="100" r="12" fill="#E5E7EB" />
      
      {/* Results List */}
      <rect x="16" y="136" width="280" height="248" fill="white" rx="6" />
      
      {/* Result Card 1 */}
      <rect x="32" y="152" width="248" height="72" fill="#F9FAFB" rx="4" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="48" y="164" width="64" height="48" fill="#E5E7EB" rx="3" />
      <rect x="128" y="164" width="120" height="12" fill="#111827" rx="2" />
      <rect x="128" y="184" width="80" height="8" fill="#9CA3AF" rx="2" />
      <rect x="128" y="200" width="60" height="12" fill="#0d9488" rx="2" />
      <circle cx="240" cy="188" r="8" fill="#E5E7EB" />
      
      {/* Result Card 2 */}
      <rect x="32" y="240" width="248" height="72" fill="#F9FAFB" rx="4" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="48" y="252" width="64" height="48" fill="#E5E7EB" rx="3" />
      <rect x="128" y="252" width="120" height="12" fill="#111827" rx="2" />
      <rect x="128" y="272" width="80" height="8" fill="#9CA3AF" rx="2" />
      <rect x="128" y="288" width="60" height="12" fill="#0d9488" rx="2" />
      <circle cx="240" cy="276" r="8" fill="#E5E7EB" />
      
      {/* Result Card 3 */}
      <rect x="32" y="328" width="248" height="48" fill="#F9FAFB" rx="4" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="48" y="340" width="64" height="32" fill="#E5E7EB" rx="3" />
      <rect x="128" y="340" width="120" height="12" fill="#111827" rx="2" />
      <rect x="128" y="360" width="80" height="8" fill="#9CA3AF" rx="2" />
      
      {/* Map View */}
      <rect x="312" y="136" width="272" height="248" fill="white" rx="6" stroke="#E5E7EB" strokeWidth="1" />
      
      {/* Map Background */}
      <rect x="328" y="152" width="240" height="216" fill="#E0F2FE" rx="3" />
      
      {/* Map Markers */}
      <circle cx="400" cy="200" r="16" fill="#0d9488" opacity="0.2" />
      <circle cx="400" cy="200" r="8" fill="#0d9488" />
      <path d="M400 208 L396 220 L404 220 Z" fill="#0d9488" />
      
      <circle cx="480" cy="240" r="16" fill="#3B82F6" opacity="0.2" />
      <circle cx="480" cy="240" r="8" fill="#3B82F6" />
      <path d="M480 248 L476 260 L484 260 Z" fill="#3B82F6" />
      
      <circle cx="440" cy="280" r="16" fill="#F59E0B" opacity="0.2" />
      <circle cx="440" cy="280" r="8" fill="#F59E0B" />
      <path d="M440 288 L436 300 L444 300 Z" fill="#F59E0B" />
      
      {/* Map Controls */}
      <rect x="520" y="168" width="32" height="64" fill="white" rx="4" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="528" y="176" width="16" height="12" fill="#9CA3AF" rx="2" />
      <rect x="528" y="196" width="16" height="12" fill="#9CA3AF" rx="2" />
      <rect x="528" y="216" width="16" height="12" fill="#9CA3AF" rx="2" />
    </svg>
  );
};

/**
 * Mobile App Backoffice Illustration
 * Shows a mobile interface for property management
 */
export const MobileAppBackofficeSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 300 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Phone Frame */}
      <rect x="20" y="20" width="260" height="560" fill="white" rx="32" stroke="#E5E7EB" strokeWidth="2" />
      <rect x="40" y="40" width="220" height="520" fill="#F9FAFB" rx="24" />
      
      {/* Status Bar */}
      <rect x="40" y="40" width="220" height="24" fill="transparent" />
      <rect x="52" y="48" width="40" height="8" fill="#111827" rx="2" />
      <circle cx="220" cy="52" r="3" fill="#10B981" />
      <circle cx="230" cy="52" r="3" fill="#10B981" />
      <circle cx="240" cy="52" r="3" fill="#10B981" />
      
      {/* Header */}
      <rect x="52" y="80" width="196" height="32" fill="white" rx="6" />
      <rect x="68" y="88" width="80" height="16" fill="#111827" rx="2" />
      <circle cx="220" cy="96" r="12" fill="#E5E7EB" />
      
      {/* Search Bar */}
      <rect x="52" y="128" width="196" height="40" fill="white" rx="8" />
      <circle cx="72" cy="148" r="8" fill="#9CA3AF" />
      <rect x="92" y="144" width="120" height="8" fill="#E5E7EB" rx="2" />
      
      {/* Property Card 1 */}
      <rect x="52" y="184" width="196" height="120" fill="white" rx="8" />
      <rect x="68" y="200" width="164" height="64" fill="#E5E7EB" rx="4" />
      <rect x="68" y="276" width="120" height="12" fill="#111827" rx="2" />
      <rect x="68" y="296" width="80" height="8" fill="#9CA3AF" rx="2" />
      <rect x="68" y="312" width="60" height="12" fill="#0d9488" rx="2" />
      
      {/* Property Card 2 */}
      <rect x="52" y="320" width="196" height="120" fill="white" rx="8" />
      <rect x="68" y="336" width="164" height="64" fill="#E5E7EB" rx="4" />
      <rect x="68" y="412" width="120" height="12" fill="#111827" rx="2" />
      <rect x="68" y="432" width="80" height="8" fill="#9CA3AF" rx="2" />
      <rect x="68" y="448" width="60" height="12" fill="#0d9488" rx="2" />
      
      {/* Bottom Navigation */}
      <rect x="40" y="520" width="220" height="40" fill="white" rx="8" />
      <rect x="60" y="532" width="32" height="16" fill="#0d9488" opacity="0.1" rx="2" />
      <rect x="60" y="532" width="24" height="8" fill="#0d9488" rx="2" />
      <rect x="108" y="532" width="32" height="16" fill="#E5E7EB" rx="2" />
      <rect x="156" y="532" width="32" height="16" fill="#E5E7EB" rx="2" />
      <rect x="204" y="532" width="32" height="16" fill="#E5E7EB" rx="2" />
    </svg>
  );
};

