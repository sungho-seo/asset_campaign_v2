import type { Config } from 'tailwindcss';

/**
 * 디자인 토큰 토대 (Phase 1).
 * - 기본 톤: 핑크/뉴트럴 (임직원 화면)
 * - 강조: LG레드 #A50034 (대시보드 + 공통 강조)
 * Phase 2에서 컴포넌트 변형에 맞춰 확장한다.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // LG 브랜드 강조
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
        // 임직원 화면 기본 핑크 톤
        pink: {
          soft: '#FCE7EE',
        },
        // 의미 색상
        success: '#16A34A',
        info: '#2563EB',
        warn: '#D97706',
        danger: '#DC2626',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        drawer: '-8px 0 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
