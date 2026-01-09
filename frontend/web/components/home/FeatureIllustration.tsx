'use client';

interface FeatureIllustrationProps {
  type: 'search' | 'manage' | 'analytics' | 'secure' | 'global' | 'performance';
  className?: string;
}

export default function FeatureIllustration({ type, className = '' }: FeatureIllustrationProps) {
  const illustrations = {
    search: (
      <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="searchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        {/* Search icon with map */}
        <circle cx="80" cy="80" r="50" fill="none" stroke="url(#searchGrad)" strokeWidth="4" />
        <line x1="115" y1="115" x2="150" y2="150" stroke="url(#searchGrad)" strokeWidth="4" strokeLinecap="round" />
        {/* Map pins */}
        <circle cx="100" cy="70" r="4" fill="#EF4444" />
        <circle cx="60" cy="90" r="4" fill="#3B82F6" />
        <circle cx="90" cy="100" r="4" fill="#F59E0B" />
      </svg>
    ),
    manage: (
      <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="manageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        {/* House/building icon */}
        <rect x="60" y="100" width="80" height="60" fill="url(#manageGrad)" rx="4" />
        <polygon points="60,100 100,60 140,100" fill="#2563EB" />
        <rect x="75" y="120" width="20" height="30" fill="white" opacity="0.8" />
        <rect x="105" y="120" width="20" height="30" fill="white" opacity="0.8" />
        <rect x="85" y="140" width="30" height="20" fill="#FBBF24" />
      </svg>
    ),
    analytics: (
      <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="analyticsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        {/* Chart/graph */}
        <line x1="40" y1="160" x2="160" y2="160" stroke="#9CA3AF" strokeWidth="2" />
        <line x1="40" y1="160" x2="40" y2="40" stroke="#9CA3AF" strokeWidth="2" />
        {/* Bars */}
        <rect x="50" y="120" width="20" height="40" fill="url(#analyticsGrad)" rx="2" />
        <rect x="80" y="100" width="20" height="60" fill="url(#analyticsGrad)" rx="2" />
        <rect x="110" y="80" width="20" height="80" fill="url(#analyticsGrad)" rx="2" />
        <rect x="140" y="60" width="20" height="100" fill="url(#analyticsGrad)" rx="2" />
        {/* Trend line */}
        <polyline points="60,140 90,120 120,90 150,70" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    secure: (
      <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="secureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
        </defs>
        {/* Shield icon */}
        <path
          d="M100 40 L140 60 L140 110 Q140 150 100 170 Q60 150 60 110 L60 60 Z"
          fill="url(#secureGrad)"
        />
        <path
          d="M100 70 L120 85 L120 110 Q120 130 100 145 Q80 130 80 110 L80 85 Z"
          fill="white"
          opacity="0.3"
        />
        {/* Checkmark */}
        <path d="M85 110 L95 120 L115 100" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    global: (
      <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="globalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Globe */}
        <circle cx="100" cy="100" r="70" fill="none" stroke="url(#globalGrad)" strokeWidth="4" />
        <ellipse cx="100" cy="100" rx="70" ry="35" fill="none" stroke="url(#globalGrad)" strokeWidth="2" opacity="0.5" />
        <line x1="100" y1="30" x2="100" y2="170" stroke="url(#globalGrad)" strokeWidth="2" opacity="0.5" />
        {/* Continents simplified */}
        <ellipse cx="100" cy="80" rx="25" ry="15" fill="url(#globalGrad)" opacity="0.3" />
        <ellipse cx="120" cy="120" rx="20" ry="12" fill="url(#globalGrad)" opacity="0.3" />
      </svg>
    ),
    performance: (
      <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="perfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        {/* Lightning/zap icon */}
        <path
          d="M100 30 L70 100 L90 100 L60 170 L120 100 L100 100 Z"
          fill="url(#perfGrad)"
        />
        {/* Speed lines */}
        <line x1="140" y1="80" x2="160" y2="70" stroke="#FBBF24" strokeWidth="2" opacity="0.6" />
        <line x1="140" y1="100" x2="165" y2="95" stroke="#FBBF24" strokeWidth="2" opacity="0.6" />
        <line x1="140" y1="120" x2="160" y2="125" stroke="#FBBF24" strokeWidth="2" opacity="0.6" />
      </svg>
    ),
  };

  return illustrations[type] || illustrations.search;
}
