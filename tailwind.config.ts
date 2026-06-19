import type { Config } from 'tailwindcss';

/**
 * 디자인 토큰 — v1(asset_campaign) 대시보드 룩앤필 토큰을 정착시키고,
 * v2 임직원 화면이 쓰던 lgred/pink 토큰도 호환 유지한다.
 * LG레드(#A50034) · 핑크(#FCE4EC)는 v1 값 그대로.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── v1 토큰 (대시보드 룩앤필 기준) ──
        bg: '#fafaf9',
        'bg-soft': '#f5f5f4',
        panel: '#ffffff',
        line: '#e7e5e4',
        'line-2': '#d6d3d1',
        text: {
          DEFAULT: '#0c0a09',
          2: '#44403c',
          3: '#78716c',
          4: '#a8a29e',
        },
        accent: '#000000',
        brand: {
          DEFAULT: '#A50034',
          2: '#C8003F',
          dark: '#7A0026',
          soft: '#FCE4EC',
        },
        focus: {
          DEFAULT: '#3b82f6',
          soft: '#dbeafe',
        },
        success: { DEFAULT: '#15803d', soft: '#dcfce7', 2: '#16a34a' },
        warn: { DEFAULT: '#a16207', soft: '#fef3c7', 2: '#ca8a04' },
        danger: { DEFAULT: '#b91c1c', soft: '#fee2e2', 2: '#dc2626' },
        purple: { DEFAULT: '#7c3aed', soft: '#ede9fe' },
        info: '#2563EB',

        // ── v2 임직원 화면 호환 토큰 ──
        lgred: {
          DEFAULT: '#A50034',
          50: '#FCE7EE',
          100: '#F8C9D9',
          200: '#EE92AE',
          300: '#E15B85',
          400: '#CC2F60',
          500: '#A50034',
          600: '#8A002B',
          700: '#6E0022',
          800: '#52001A',
          900: '#360011',
        },
        pink: {
          soft: '#FCE4EC',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        sm: '6px',
        card: '12px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,.04)',
        DEFAULT: '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
        lg: '0 20px 40px -12px rgba(0,0,0,.18), 0 8px 16px -8px rgba(0,0,0,.08)',
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        drawer: '-8px 0 24px rgba(0,0,0,0.12)',
      },
      letterSpacing: {
        tightish: '-0.01em',
        tighter2: '-0.02em',
      },
    },
  },
  plugins: [],
};

export default config;
