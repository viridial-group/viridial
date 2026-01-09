import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			// Viridial Theme Colors
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			// Viridial semantic colors
  			success: 'var(--color-success)',
  			warning: 'var(--color-warning)',
  			info: 'var(--color-info)',
  			danger: 'var(--color-danger)',
			// Modern Artistic Viridial Palette - Sophisticated Teal/Emerald
			viridial: {
				50: '#f0fdfa',   // Softest mint - backgrounds
				100: '#d1fae5',  // Light mint - subtle accents
				200: '#a7f3d0',  // Fresh mint - hover states
				300: '#6ee7b7',  // Bright mint - active states
				400: '#34d399',  // Vibrant emerald - interactive elements
				500: '#10b981',  // Primary emerald - main brand color
				600: '#059669',  // Deep emerald - primary actions
				700: '#047857',  // Rich forest - accents & hover
				800: '#065f46',  // Deep forest - dark mode
				900: '#064e3b',  // Darkest forest - deepest accents
				950: '#022c22',  // Near black with green tint
			},
  			mint: {
  				50: '#f0fdfa',
  				100: '#ccfbf1',
  				200: '#99f6e4',
  				300: '#5eead4',
  				400: '#2dd4bf',
  				500: '#14b8a6',
  				600: '#0d9488',
  				700: '#0f766e',
  				800: '#115e59',
  				900: '#134e4a',
  			},
  			jade: {
  				50: '#f0fdf4',
  				100: '#dcfce7',
  				200: '#bbf7d0',
  				300: '#86efac',
  				400: '#4ade80',
  				500: '#22c55e',
  				600: '#16a34a',
  				700: '#15803d',
  				800: '#166534',
  				900: '#14532d',
  			},
  		},
  		fontFamily: {
  			sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  		},
  		borderRadius: {
  			lg: 'var(--radius-lg)',
  			md: 'var(--radius-md)',
  			sm: 'var(--radius-sm)'
  		},
  		spacing: {
  			'xs': 'var(--space-xs)',
  			'sm': 'var(--space-sm)',
  			'md': 'var(--space-md)',
  			'lg': 'var(--space-lg)',
  			'xl': 'var(--space-xl)',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.6s ease-out forwards'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

