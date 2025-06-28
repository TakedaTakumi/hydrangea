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
