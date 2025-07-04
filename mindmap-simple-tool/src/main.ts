// Application entry point
import { MindMapApp } from '@/core/app.ts';
import '@/config/theme.ts';

/**
 * アプリケーションの初期化と起動
 */
function main(): void {
  try {
    // eslint-disable-next-line no-console
    console.log('🚀 マインドマップアプリケーションを初期化中...');

    // アプリケーションインスタンスの作成
    const app = new MindMapApp();

    // アプリケーションの初期化
    app.initialize();

    // demo-render.ts の import を削除（本体ロジックに統合済み）

    // eslint-disable-next-line no-console
    console.log('✅ マインドマップアプリケーションが正常に起動しました');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ アプリケーションの初期化に失敗しました:', error);

    // エラー画面の表示
    showErrorScreen(error as Error);
  }
}

/**
 * エラー画面の表示
 */
function showErrorScreen(error: Error): void {
  if (typeof document === 'undefined') return;

  const appElement = document.getElementById('app');
  if (!appElement) return;

  appElement.innerHTML = `
    <div class="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div class="text-center max-w-md mx-auto p-6">
        <div class="w-16 h-16 mx-auto mb-4 text-red-500">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          アプリケーションエラー
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          アプリケーションの初期化中にエラーが発生しました。
        </p>
        <details class="text-left">
          <summary class="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            エラー詳細を表示
          </summary>
          <pre class="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-800 dark:text-gray-200 overflow-auto">
${error.message}
${error.stack}
          </pre>
        </details>
        <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          再読み込み
        </button>
      </div>
    </div>
  `;
}

// DOM読み込み完了後にアプリケーションを起動
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => void main());
  } else {
    void main();
  }
}
