'use client';

export default function EcologyIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 600 500"
        className="w-full h-auto max-w-lg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#F0FDF4" />
          </linearGradient>
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="solarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Sky background */}
        <rect width="600" height="500" fill="url(#skyGrad)" />

        {/* Sun */}
        <circle cx="500" cy="80" r="50" fill="url(#solarGrad)" opacity="0.9" filter="url(#shadow)">
          <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Solar panels on house roof */}
        <g transform="translate(200, 180)">
          {/* House */}
          <rect x="0" y="100" width="180" height="150" fill="#FED7AA" rx="8" filter="url(#shadow)" />
          <polygon points="0,100 90,40 180,100" fill="#7C2D12" />
          
          {/* Solar panels */}
          <rect x="20" y="60" width="140" height="35" fill="#1E293B" rx="4" />
          <line x1="40" y1="60" x2="40" y2="95" stroke="#10B981" strokeWidth="2" />
          <line x1="80" y1="60" x2="80" y2="95" stroke="#10B981" strokeWidth="2" />
          <line x1="120" y1="60" x2="120" y2="95" stroke="#10B981" strokeWidth="2" />
          <line x1="160" y1="60" x2="160" y2="95" stroke="#10B981" strokeWidth="2" />
          
          {/* Windows */}
          <rect x="30" y="130" width="40" height="50" fill="#BFDBFE" rx="4" />
          <rect x="110" y="130" width="40" height="50" fill="#BFDBFE" rx="4" />
          
          {/* Green door */}
          <rect x="75" y="200" width="30" height="50" fill="url(#leafGrad)" rx="4" />
        </g>

        {/* Trees */}
        <g transform="translate(80, 300)">
          {/* Tree 1 */}
          <ellipse cx="0" cy="0" rx="40" ry="50" fill="url(#leafGrad)" opacity="0.8" />
          <rect x="-8" y="50" width="16" height="80" fill="#78350F" />
        </g>

        <g transform="translate(520, 320)">
          {/* Tree 2 */}
          <ellipse cx="0" cy="0" rx="45" ry="55" fill="url(#leafGrad)" opacity="0.8" />
          <rect x="-8" y="55" width="16" height="75" fill="#78350F" />
        </g>

        {/* Wind turbines */}
        <g transform="translate(100, 100)">
          {/* Windmill */}
          <rect x="-4" y="0" width="8" height="60" fill="#64748B" />
          <circle cx="0" cy="20" r="8" fill="#475569" />
          <g transform="rotate(45 0 20)">
            <line x1="0" y1="20" x2="0" y2="-30" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
            <line x1="0" y1="20" x2="0" y2="70" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
            <line x1="0" y1="20" x2="-30" y2="20" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
            <line x1="0" y1="20" x2="30" y2="20" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
          </g>
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="45 0 20"
            to="405 0 20"
            dur="4s"
            repeatCount="indefinite"
          />
        </g>

        {/* Eco badge */}
        <g transform="translate(450, 250)">
          <circle cx="0" cy="0" r="45" fill="white" opacity="0.95" filter="url(#shadow)" />
          <path
            d="M-20,-10 Q-20,-20 -10,-20 L10,-20 Q20,-20 20,-10 L20,10 Q20,20 10,20 L-10,20 Q-20,20 -20,10 Z"
            fill="url(#leafGrad)"
            transform="rotate(-20 0 0)"
          />
          <circle cx="-8" cy="-5" r="4" fill="white" />
        </g>

        {/* Leaves floating */}
        <g opacity="0.7">
          <ellipse cx="150" cy="200" rx="8" ry="12" fill="url(#leafGrad)" transform="rotate(30 150 200)">
            <animate attributeName="cy" values="200;180;200" dur="3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="300" cy="220" rx="6" ry="10" fill="url(#leafGrad)" transform="rotate(-45 300 220)">
            <animate attributeName="cy" values="220;200;220" dur="2.5s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="450" cy="180" rx="7" ry="11" fill="url(#leafGrad)" transform="rotate(60 450 180)">
            <animate attributeName="cy" values="180;160;180" dur="3.5s" repeatCount="indefinite" />
          </ellipse>
        </g>

        {/* Energy lines (subtle) */}
        <g opacity="0.3">
          <path
            d="M 200 250 Q 300 200 400 250"
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            strokeDasharray="5,5"
          >
            <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite" />
          </path>
        </g>

        {/* Ground with grass */}
        <ellipse cx="300" cy="480" rx="600" ry="60" fill="#86EFAC" opacity="0.4" />
      </svg>
    </div>
  );
}
