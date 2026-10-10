import type { Config } from 'tailwindcss';

/** Every colour is a CSS variable (see src/app/globals.css) so the three themes can swap palettes. */
const c = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: c('ink'), soft: c('ink-soft'), deep: c('ink-deep') },
        slate: { DEFAULT: c('slate'), light: c('slate-light') },
        mist: { DEFAULT: c('mist'), deep: c('mist-deep') },
        signal: { DEFAULT: c('signal'), light: c('signal-light'), dark: c('signal-dark') },
        amber: { DEFAULT: c('amber'), light: c('amber-light'), dark: c('amber-dark') },
        danger: { DEFAULT: c('danger'), light: c('danger-light') },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl2: '1.25rem' },
      boxShadow: { card: 'var(--shadow-card)' },
    },
  },
  plugins: [],
};
export default config;
