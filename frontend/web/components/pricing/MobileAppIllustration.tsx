import React from 'react';

export const MobileAppIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 400 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Phone Frame */}
      <rect x="40" y="40" width="320" height="640" rx="32" fill="#1E293B" />
      <rect x="56" y="80" width="288" height="592" rx="24" fill="white" />
      
      {/* Status Bar */}
      <rect x="64" y="88" width="272" height="24" fill="transparent" />
      <rect x="72" y="96" width="60" height="8" fill="#1E293B" rx="2" />
      <circle cx="340" cy="100" r="3" fill="#1E293B" />
      <rect x="348" y="96" width="20" height="8" fill="#1E293B" rx="2" />
      
      {/* Header */}
      <rect x="64" y="120" width="272" height="56" fill="white" />
      <rect x="80" y="136" width="120" height="24" fill="#1E293B" rx="4" />
      <circle cx="312" cy="148" r="16" fill="#F1F5F9" />
      <circle cx="312" cy="148" r="8" fill="#64748B" />
      
      {/* Search Bar */}
      <rect x="64" y="184" width="272" height="48" fill="#F8FAFC" rx="12" />
      <circle cx="88" cy="208" r="8" fill="#64748B" />
      <rect x="104" y="200" width="200" height="16" fill="#E2E8F0" rx="2" />
      
      {/* Quick Filters */}
      <rect x="64" y="248" width="272" height="40" fill="white" />
      <rect x="80" y="256" width="80" height="24" fill="#3B82F6" rx="12" />
      <rect x="176" y="256" width="60" height="24" fill="#F1F5F9" rx="12" />
      <rect x="252" y="256" width="60" height="24" fill="#F1F5F9" rx="12" />
      <rect x="328" y="256" width="8" height="24" fill="#E2E8F0" rx="4" />
      
      {/* Property Card 1 */}
      <rect x="64" y="304" width="272" height="200" fill="white" rx="12" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="72" y="312" width="256" height="120" fill="#E2E8F0" rx="8" />
      <rect x="72" y="312" width="256" height="24" fill="#CBD5E1" rx="8" />
      
      {/* Badge */}
      <rect x="280" y="328" width="40" height="20" fill="#10B981" opacity="0.9" rx="4" />
      <path d="M288 336 L292 344 L304 328" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      
      <rect x="72" y="440" width="180" height="20" fill="#1E293B" rx="2" />
      <rect x="72" y="468" width="120" height="12" fill="#64748B" rx="2" />
      
      {/* Stats Row */}
      <rect x="72" y="488" width="60" height="12" fill="#E2E8F0" rx="2" />
      <rect x="148" y="488" width="60" height="12" fill="#E2E8F0" rx="2" />
      <rect x="224" y="488" width="60" height="12" fill="#E2E8F0" rx="2" />
      
      {/* Property Card 2 */}
      <rect x="64" y="520" width="272" height="200" fill="white" rx="12" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="72" y="528" width="256" height="120" fill="#E2E8F0" rx="8" />
      <rect x="72" y="528" width="256" height="24" fill="#CBD5E1" rx="8" />
      
      <rect x="72" y="656" width="180" height="20" fill="#1E293B" rx="2" />
      <rect x="72" y="684" width="120" height="12" fill="#64748B" rx="2" />
      
      {/* Stats Row */}
      <rect x="72" y="704" width="60" height="12" fill="#E2E8F0" rx="2" />
      <rect x="148" y="704" width="60" height="12" fill="#E2E8F0" rx="2" />
      <rect x="224" y="704" width="60" height="12" fill="#E2E8F0" rx="2" />
      
      {/* Bottom Navigation */}
      <rect x="64" y="640" width="272" height="64" fill="white" rx="24 24 0 0" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="80" y="656" width="56" height="32" fill="transparent" rx="8" />
      <circle cx="108" cy="672" r="12" fill="#3B82F6" />
      <rect x="80" y="688" width="56" height="4" fill="#3B82F6" rx="2" />
      
      <rect x="152" y="656" width="56" height="32" fill="transparent" rx="8" />
      <circle cx="180" cy="672" r="12" fill="#CBD5E1" />
      
      <rect x="224" y="656" width="56" height="32" fill="transparent" rx="8" />
      <circle cx="252" cy="672" r="12" fill="#CBD5E1" />
      
      <rect x="296" y="656" width="40" height="32" fill="transparent" rx="8" />
      <circle cx="316" cy="672" r="12" fill="#CBD5E1" />
      
      {/* Home Indicator */}
      <rect x="176" y="768" width="48" height="4" fill="#CBD5E1" rx="2" />
    </svg>
  );
};

