/**
 * テーマ管理とダークモード切り替え
 */

/**
 * テーマの初期化
 */
function initializeTheme(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // システム設定またはLocalStorageからテーマを読み込み
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches;

  const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * テーマの切り替え
 */
export function toggleTheme(): void {
  if (typeof document === 'undefined' || typeof localStorage === 'undefined')
    return;

  const isDark = document.documentElement.classList.contains('dark');

  if (isDark) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

/**
 * 現在のテーマを取得
 */
export function getCurrentTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

// システム設定の変更を監視
if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    });

  // ページ読み込み時にテーマを初期化
  initializeTheme();
}

// Tailwind CSS カラーパレット（主要色のみ抜粋）
export const TAILWIND_COLORS = {
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  red: {
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
  },
  blue: {
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
  },
  green: {
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
  },
  yellow: {
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
  },
  // ...必要に応じて追加
} as const;

export type TailwindColorName = keyof typeof TAILWIND_COLORS;
export type TailwindColorShade<C extends TailwindColorName> =
  keyof (typeof TAILWIND_COLORS)[C];

/**
 * Tailwindカラー名・シェードからHEX値を取得（型安全）
 */
export function getTailwindColor<
  C extends TailwindColorName,
  S extends TailwindColorShade<C>,
>(color: C, shade: S): (typeof TAILWIND_COLORS)[C][S] {
  return TAILWIND_COLORS[color][shade];
}
