/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'monospace'],
                display: ['var(--font-display)', 'system-ui', 'sans-serif'],
            },
            colors: {
                background: 'var(--background)',
                surface: 'var(--surface)',
                'surface-2': 'var(--surface-2)',
                border: 'var(--border)',
                'border-2': 'var(--border-2)',
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    muted: 'var(--text-muted)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    glow: 'var(--accent-glow)',
                },
                risk: {
                    critical: '#ef4444',
                    high: '#f97316',
                    medium: '#eab308',
                    low: '#22c55e',
                    unknown: '#6b7280',
                },
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'scan-line': 'scanLine 2s linear infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                scanLine: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100vh)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px var(--accent-glow), 0 0 10px var(--accent-glow)' },
                    '100%': { boxShadow: '0 0 20px var(--accent-glow), 0 0 40px var(--accent-glow), 0 0 60px var(--accent-glow)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
            backgroundImage: {
                'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ff88' fill-opacity='0.03'%3E%3Cpath d='M0 0h1v40H0zm40 0h-1v40h1zM0 0v1h40V0zM0 40v-1h40v1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            },
        },
    },
    plugins: [],
}