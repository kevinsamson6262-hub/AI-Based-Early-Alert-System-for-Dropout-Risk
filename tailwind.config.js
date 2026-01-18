/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: '#FDFBF7',
  			foreground: '#1F2937',
  			primary: {
  				DEFAULT: '#C05621',
  				foreground: '#FFFFFF'
  			},
  			secondary: {
  				DEFAULT: '#475569',
  				foreground: '#F8FAFC'
  			},
  			muted: {
  				DEFAULT: '#F3F4F6',
  				foreground: '#6B7280'
  			},
  			accent: {
  				DEFAULT: '#F0FDF4',
  				foreground: '#166534'
  			},
  			border: '#E5E7EB',
  			risk: {
  				high: '#DC2626',
  				medium: '#D97706',
  				low: '#059669'
  			}
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
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};