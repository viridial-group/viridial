'use client';

export default function HeroIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Main property illustration */}
      <svg
        viewBox="0 0 800 600"
        className="w-full h-auto max-w-2xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EFF6FF" />
            <stop offset="100%" stopColor="#F0FDF4" />
          </linearGradient>
          <linearGradient id="houseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#FED7AA" />
          </linearGradient>
          <linearGradient id="roofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FCA5A5" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* Sky background */}
        <rect width="800" height="600" fill="url(#skyGradient)" />

        {/* Clouds */}
        <circle cx="100" cy="80" r="30" fill="white" opacity="0.8" className="animate-pulse" />
        <circle cx="130" cy="80" r="40" fill="white" opacity="0.8" />
        <circle cx="155" cy="80" r="30" fill="white" opacity="0.8" />
        
        <circle cx="650" cy="120" r="25" fill="white" opacity="0.7" className="animate-pulse" style={{ animationDelay: '1s' }} />
        <circle cx="675" cy="120" r="35" fill="white" opacity="0.7" />
        <circle cx="705" cy="120" r="25" fill="white" opacity="0.7" />

        {/* Ground */}
        <ellipse cx="400" cy="550" rx="600" ry="100" fill="#86EFAC" opacity="0.3" />

        {/* Main house */}
        <g transform="translate(200, 150)" filter="url(#shadow)">
          {/* House body */}
          <rect x="0" y="150" width="200" height="180" fill="url(#houseGradient)" rx="8" />
          
          {/* Windows */}
          <rect x="25" y="200" width="50" height="50" fill="#BFDBFE" rx="4" />
          <rect x="125" y="200" width="50" height="50" fill="#BFDBFE" rx="4" />
          <rect x="25" y="270" width="50" height="50" fill="#BFDBFE" rx="4" />
          <rect x="125" y="270" width="50" height="50" fill="#BFDBFE" rx="4" />
          
          {/* Window frames */}
          <line x1="50" y1="200" x2="50" y2="250" stroke="#60A5FA" strokeWidth="2" />
          <line x1="25" y1="225" x2="75" y2="225" stroke="#60A5FA" strokeWidth="2" />
          <line x1="150" y1="200" x2="150" y2="250" stroke="#60A5FA" strokeWidth="2" />
          <line x1="125" y1="225" x2="175" y2="225" stroke="#60A5FA" strokeWidth="2" />
          
          {/* Door */}
          <rect x="75" y="280" width="50" height="50" fill="#7C3AED" rx="4" />
          <circle cx="110" cy="305" r="3" fill="#FBBF24" />
          
          {/* Roof */}
          <polygon points="0,150 100,50 200,150" fill="url(#roofGradient)" />
          
          {/* Roof details */}
          <line x1="0" y1="150" x2="200" y2="150" stroke="#DC2626" strokeWidth="2" />
          
          {/* Chimney */}
          <rect x="160" y="80" width="20" height="70" fill="#78350F" />
          <rect x="158" y="80" width="24" height="8" fill="#92400E" rx="2" />
        </g>

        {/* Search/map icon overlay - animated */}
        <g transform="translate(500, 250)" className="animate-bounce" style={{ animationDuration: '3s' }}>
          <circle cx="0" cy="0" r="60" fill="white" opacity="0.9" filter="url(#shadow)" />
          <circle cx="0" cy="0" r="50" fill="#10B981" opacity="0.1" />
          
          {/* Map pin */}
          <g transform="translate(-15, -25)">
            <path
              d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 35 15 35s15-23.75 15-35C30 6.716 23.284 0 15 0z"
              fill="#EF4444"
            />
            <circle cx="15" cy="15" r="6" fill="white" />
          </g>
        </g>

        {/* Location pins scattered */}
        <g opacity="0.7">
          <circle cx="150" cy="450" r="8" fill="#10B981" className="animate-pulse" />
          <circle cx="250" cy="480" r="8" fill="#3B82F6" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
          <circle cx="550" cy="470" r="8" fill="#F59E0B" className="animate-pulse" style={{ animationDelay: '1s' }} />
          <circle cx="650" cy="450" r="8" fill="#8B5CF6" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
        </g>

        {/* Floating search icons */}
        <g transform="translate(100, 350)" opacity="0.6">
          <circle cx="0" cy="0" r="25" fill="white" filter="url(#shadow)" />
          <circle cx="0" cy="0" r="8" fill="none" stroke="#10B981" strokeWidth="2" />
          <line x1="12" y1="12" x2="20" y2="20" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
        </g>

        <g transform="translate(700, 400)" opacity="0.6" className="animate-pulse">
          <circle cx="0" cy="0" r="25" fill="white" filter="url(#shadow)" />
          <circle cx="0" cy="0" r="8" fill="none" stroke="#3B82F6" strokeWidth="2" />
          <line x1="12" y1="12" x2="20" y2="20" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
