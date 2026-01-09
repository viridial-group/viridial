import React from 'react';

export const AnalyticsIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
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
      <rect x="44" y="44" width="200" height="24" fill="#CBD5E1" rx="4" />
      <rect x="660" y="44" width="100" height="32" fill="#3B82F6" rx="4" />
      
      {/* Date Range Picker */}
      <rect x="24" y="104" width="752" height="48" fill="white" rx="8" />
      <rect x="44" y="120" width="120" height="32" fill="#F1F5F9" rx="4" />
      <rect x="180" y="120" width="24" height="32" fill="#E2E8F0" rx="4" />
      <rect x="220" y="120" width="120" height="32" fill="#F1F5F9" rx="4" />
      
      {/* Main Chart */}
      <rect x="24" y="168" width="488" height="320" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="44" y="192" width="200" height="20" fill="#CBD5E1" rx="4" />
      
      {/* Chart Area with Gradient */}
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Chart Line */}
      <path
        d="M 80 400 Q 140 360, 200 340 T 320 300 T 440 280 T 460 260"
        stroke="#3B82F6"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 80 400 Q 140 360, 200 340 T 320 300 T 440 280 T 460 260 L 460 400 L 80 400 Z"
        fill="url(#chartGradient)"
      />
      
      {/* Chart Points */}
      <circle cx="80" cy="400" r="4" fill="#3B82F6" />
      <circle cx="200" cy="340" r="4" fill="#3B82F6" />
      <circle cx="320" cy="300" r="4" fill="#3B82F6" />
      <circle cx="440" cy="280" r="4" fill="#3B82F6" />
      <circle cx="460" cy="260" r="6" fill="#3B82F6" stroke="white" strokeWidth="2" />
      
      {/* Y Axis Labels */}
      <rect x="44" y="380" width="20" height="12" fill="#64748B" rx="2" />
      <rect x="44" y="340" width="20" height="12" fill="#64748B" rx="2" />
      <rect x="44" y="300" width="20" height="12" fill="#64748B" rx="2" />
      <rect x="44" y="260" width="20" height="12" fill="#64748B" rx="2" />
      
      {/* X Axis Labels */}
      <rect x="88" y="420" width="40" height="12" fill="#64748B" rx="2" />
      <rect x="208" y="420" width="40" height="12" fill="#64748B" rx="2" />
      <rect x="328" y="420" width="40" height="12" fill="#64748B" rx="2" />
      <rect x="448" y="420" width="40" height="12" fill="#64748B" rx="2" />
      
      {/* Stats Panel */}
      <rect x="528" y="168" width="248" height="152" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="548" y="192" width="180" height="16" fill="#CBD5E1" rx="2" />
      
      {/* Stat Item 1 */}
      <rect x="548" y="224" width="208" height="1" fill="#E2E8F0" />
      <circle cx="568" cy="248" r="16" fill="#10B981" opacity="0.1" />
      <path d="M560 248 L568 256 L576 240" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="596" y="240" width="80" height="12" fill="#CBD5E1" rx="2" />
      <rect x="596" y="260" width="40" height="16" fill="#1E293B" rx="2" />
      
      {/* Stat Item 2 */}
      <rect x="548" y="280" width="208" height="1" fill="#E2E8F0" />
      <circle cx="568" cy="304" r="16" fill="#3B82F6" opacity="0.1" />
      <circle cx="576" cy="304" r="6" fill="#3B82F6" />
      <rect x="596" y="296" width="80" height="12" fill="#CBD5E1" rx="2" />
      <rect x="596" y="316" width="40" height="16" fill="#1E293B" rx="2" />
      
      {/* Donut Chart */}
      <rect x="528" y="336" width="248" height="152" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="548" y="360" width="140" height="16" fill="#CBD5E1" rx="2" />
      
      {/* Donut Chart Circle */}
      <circle cx="652" cy="440" r="60" fill="none" stroke="#E2E8F0" strokeWidth="12" />
      <circle
        cx="652"
        cy="440"
        r="60"
        fill="none"
        stroke="#10B981"
        strokeWidth="12"
        strokeDasharray={`${2 * Math.PI * 60 * 0.6} ${2 * Math.PI * 60}`}
        strokeDashoffset={-2 * Math.PI * 60 * 0.2}
        transform="rotate(-90 652 440)"
      />
      <circle
        cx="652"
        cy="440"
        r="60"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="12"
        strokeDasharray={`${2 * Math.PI * 60 * 0.3} ${2 * Math.PI * 60}`}
        strokeDashoffset={-2 * Math.PI * 60 * 0.5}
        transform="rotate(-90 652 440)"
      />
      
      <rect x="620" y="460" width="64" height="16" fill="#1E293B" rx="2" />
      
      {/* Legend */}
      <rect x="568" y="480" width="12" height="12" fill="#10B981" rx="2" />
      <rect x="588" y="480" width="60" height="12" fill="#CBD5E1" rx="2" />
      <rect x="656" y="480" width="12" height="12" fill="#3B82F6" rx="2" />
      <rect x="676" y="480" width="60" height="12" fill="#CBD5E1" rx="2" />
    </svg>
  );
};

