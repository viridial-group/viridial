import React from 'react';

export const LeadManagementIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
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
      <rect x="44" y="44" width="180" height="24" fill="#CBD5E1" rx="4" />
      <rect x="640" y="44" width="100" height="32" fill="#3B82F6" rx="4" />
      
      {/* Tabs */}
      <rect x="24" y="104" width="752" height="48" fill="white" rx="8" />
      <rect x="44" y="120" width="100" height="32" fill="#3B82F6" rx="4" />
      <rect x="160" y="120" width="100" height="32" fill="#F1F5F9" rx="4" />
      <rect x="276" y="120" width="100" height="32" fill="#F1F5F9" rx="4" />
      <rect x="392" y="120" width="100" height="32" fill="#F1F5F9" rx="4" />
      
      {/* Filter Bar */}
      <rect x="24" y="168" width="752" height="48" fill="white" rx="8" />
      <rect x="44" y="184" width="140" height="32" fill="#F1F5F9" rx="4" />
      <rect x="200" y="184" width="100" height="32" fill="#F1F5F9" rx="4" />
      <rect x="316" y="184" width="100" height="32" fill="#F1F5F9" rx="4" />
      <circle cx="432" cy="200" r="12" fill="#64748B" />
      
      {/* Leads List */}
      <rect x="24" y="232" width="488" height="344" fill="white" rx="8" />
      
      {/* Lead Card 1 - Hot */}
      <rect x="40" y="256" width="456" height="120" fill="white" rx="8" stroke="#EF4444" strokeWidth="2" />
      <circle cx="64" cy="288" r="20" fill="#EF4444" opacity="0.1" />
      <circle cx="64" cy="288" r="12" fill="#EF4444" />
      <path d="M60 288 L68 296 L76 284" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="96" y="276" width="120" height="16" fill="#1E293B" rx="2" />
      <rect x="96" y="300" width="80" height="12" fill="#64748B" rx="2" />
      <rect x="440" y="276" width="40" height="20" fill="#EF4444" opacity="0.1" rx="4" />
      <rect x="450" y="282" width="20" height="8" fill="#EF4444" rx="2" />
      <rect x="96" y="320" width="200" height="12" fill="#E2E8F0" rx="2" />
      <rect x="96" y="340" width="160" height="12" fill="#E2E8F0" rx="2" />
      <rect x="320" y="328" width="60" height="28" fill="#3B82F6" rx="4" />
      <rect x="396" y="328" width="60" height="28" fill="#F1F5F9" rx="4" />
      
      {/* Lead Card 2 - Warm */}
      <rect x="40" y="392" width="456" height="120" fill="white" rx="8" stroke="#F59E0B" strokeWidth="1" />
      <circle cx="64" cy="424" r="20" fill="#F59E0B" opacity="0.1" />
      <circle cx="64" cy="424" r="12" fill="#F59E0B" />
      <path d="M60 424 L68 432 L76 420" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="96" y="412" width="120" height="16" fill="#1E293B" rx="2" />
      <rect x="96" y="436" width="80" height="12" fill="#64748B" rx="2" />
      <rect x="440" y="412" width="40" height="20" fill="#F59E0B" opacity="0.1" rx="4" />
      <rect x="450" y="418" width="20" height="8" fill="#F59E0B" rx="2" />
      <rect x="96" y="456" width="200" height="12" fill="#E2E8F0" rx="2" />
      <rect x="96" y="476" width="160" height="12" fill="#E2E8F0" rx="2" />
      <rect x="320" y="464" width="60" height="28" fill="#3B82F6" rx="4" />
      <rect x="396" y="464" width="60" height="28" fill="#F1F5F9" rx="4" />
      
      {/* Lead Card 3 - Cold */}
      <rect x="40" y="528" width="456" height="120" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      <circle cx="64" cy="560" r="20" fill="#64748B" opacity="0.1" />
      <circle cx="64" cy="560" r="12" fill="#64748B" />
      <path d="M60 560 L68 568 L76 556" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="96" y="548" width="120" height="16" fill="#1E293B" rx="2" />
      <rect x="96" y="572" width="80" height="12" fill="#64748B" rx="2" />
      <rect x="96" y="592" width="200" height="12" fill="#E2E8F0" rx="2" />
      <rect x="96" y="612" width="160" height="12" fill="#E2E8F0" rx="2" />
      <rect x="320" y="600" width="60" height="28" fill="#3B82F6" rx="4" />
      <rect x="396" y="600" width="60" height="28" fill="#F1F5F9" rx="4" />
      
      {/* Lead Details Panel */}
      <rect x="528" y="232" width="248" height="344" fill="white" rx="8" stroke="#E2E8F0" strokeWidth="1" />
      
      {/* Avatar */}
      <circle cx="652" cy="296" r="32" fill="#E2E8F0" />
      <circle cx="652" cy="296" r="24" fill="#CBD5E1" />
      <circle cx="652" cy="296" r="16" fill="#94A3B8" />
      
      {/* Name */}
      <rect x="584" y="340" width="136" height="20" fill="#1E293B" rx="2" />
      <rect x="584" y="372" width="100" height="12" fill="#64748B" rx="2" />
      
      {/* Contact Info */}
      <rect x="552" y="400" width="200" height="1" fill="#E2E8F0" />
      <rect x="552" y="416" width="60" height="12" fill="#CBD5E1" rx="2" />
      <rect x="552" y="436" width="180" height="12" fill="#E2E8F0" rx="2" />
      <rect x="552" y="456" width="60" height="12" fill="#CBD5E1" rx="2" />
      <rect x="552" y="476" width="180" height="12" fill="#E2E8F0" rx="2" />
      
      {/* Activity Timeline */}
      <rect x="552" y="508" width="60" height="12" fill="#CBD5E1" rx="2" />
      <rect x="552" y="528" width="200" height="1" fill="#E2E8F0" />
      
      {/* Timeline Item */}
      <circle cx="572" cy="552" r="4" fill="#3B82F6" />
      <rect x="592" y="544" width="120" height="12" fill="#E2E8F0" rx="2" />
      <rect x="592" y="564" width="80" height="10" fill="#CBD5E1" rx="2" />
      
      <circle cx="572" cy="592" r="4" fill="#10B981" />
      <rect x="592" y="584" width="120" height="12" fill="#E2E8F0" rx="2" />
      <rect x="592" y="604" width="80" height="10" fill="#CBD5E1" rx="2" />
      
      {/* Actions */}
      <rect x="552" y="536" width="200" height="1" fill="#E2E8F0" />
      <rect x="568" y="552" width="80" height="36" fill="#3B82F6" rx="4" />
      <rect x="664" y="552" width="80" height="36" fill="#F1F5F9" rx="4" />
    </svg>
  );
};

