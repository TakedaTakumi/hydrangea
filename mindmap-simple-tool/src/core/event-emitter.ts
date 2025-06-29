/**
 * Observer Pattern の実装
 * 型安全なイベント発行・購読システムを提供するEventEmitterクラス
 */

import type {
  EventHandler,
  EventListener,
  UnsubscribeFunction,
  EventEmitter as IEventEmitter,
  EventBusConfig,
  SubscriptionOptions,
  EventMiddleware,
  TypedEventMap,
} from '../types/event';

// ============================================================================
// 基本EventEmitterの実装
// ============================================================================

/**
 * 型安全なイベントエミッターの実装
 * Observer Patternに基づく軽量で高性能なイベントシステム
 */
export class EventEmitter implements IEventEmitter {
  /** イベントリスナーの管理マップ */
  private listeners: Map<string, EventListener[]> = new Map();

  /** 最大リスナー数 */
  private maxListeners: number = 100;

  /** デバッグモード */
  private debug: boolean = false;

  /** エラーハンドラー */
  private errorHandler?: (error: Error, eventType: string, data?: any) => void;

  /** ログ出力関数 */
  private logger?: (
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: any
  ) => void;

  /** ミドルウェアスタック */
  private middlewares: EventMiddleware[] = [];

  /**
   * コンストラクタ
   * @param config - EventBusの設定
   */
  constructor(config?: Partial<EventBusConfig>) {
    if (config) {
      this.maxListeners = config.maxListeners ?? this.maxListeners;
      this.debug = config.debug ?? this.debug;
      if (config.errorHandler) {
        this.errorHandler = config.errorHandler;
      }
      if (config.logger) {
        this.logger = config.logger;
      }
    }
  }

  /**
   * イベントを発行
   * @param eventType - イベントタイプ
   * @param data - イベントデータ
   */
  emit<T = any>(eventType: string, data?: T): void {
    this.log('debug', `Emitting event: ${eventType}`, data);

    try {
      // ミドルウェアを適用
      this.applyMiddlewares(eventType, data, () => {
        this.executeListeners(eventType, data);
      });
    } catch (error) {
      this.handleError(error as Error, eventType, data);
    }
  }

  /**
   * イベントリスナーを登録
   * @param eventType - イベントタイプ
   * @param handler - イベントハンドラー
   * @param options - 購読オプション
   * @returns 購読解除関数
   */
  on<T = any>(
    eventType: string,
    handler: EventHandler<T>,
    options?: Partial<EventListener<T>>
  ): UnsubscribeFunction {
    return this.addListener(eventType, handler, { ...options, once: false });
  }

  /**
   * 一度だけ実行されるイベントリスナーを登録
   * @param eventType - イベントタイプ
   * @param handler - イベントハンドラー
   * @returns 購読解除関数
   */
  once<T = any>(
    eventType: string,
    handler: EventHandler<T>
  ): UnsubscribeFunction {
    return this.addListener(eventType, handler, { once: true });
  }

  /**
   * イベントリスナーを削除
   * @param eventType - イベントタイプ
   * @param handler - 削除するハンドラー（省略時は全て削除）
   */
  off(eventType: string, handler?: EventHandler): void {
    const listeners = this.listeners.get(eventType);
    if (!listeners) return;

    if (handler) {
      // 特定のハンドラーを削除
      const index = listeners.findIndex(
        listener => listener.handler === handler
      );
      if (index !== -1) {
        listeners.splice(index, 1);
        this.log('debug', `Removed listener for event: ${eventType}`);
      }
    } else {
      // 全てのハンドラーを削除
      listeners.length = 0;
      this.log('debug', `Removed all listeners for event: ${eventType}`);
    }

    // 空の配列になった場合はMapから削除
    if (listeners.length === 0) {
      this.listeners.delete(eventType);
    }
  }

  /**
   * 全てのイベントリスナーを削除
   * @param eventType - イベントタイプ（省略時は全イベント）
   */
  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
      this.log('debug', `Removed all listeners for event: ${eventType}`);
    } else {
      this.listeners.clear();
      this.log('debug', 'Removed all listeners for all events');
    }
  }

  /**
   * 登録されているリスナー数を取得
   * @param eventType - イベントタイプ
   * @returns リスナー数
   */
  listenerCount(eventType: string): number {
    const listeners = this.listeners.get(eventType);
    return listeners ? listeners.length : 0;
  }

  /**
   * イベントタイプ一覧を取得
   * @returns イベントタイプの配列
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * ミドルウェアを追加
   * @param middleware - ミドルウェア関数
   */
  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * ミドルウェアを削除
   * @param middleware - 削除するミドルウェア関数
   */
  removeMiddleware(middleware: EventMiddleware): void {
    const index = this.middlewares.indexOf(middleware);
    if (index !== -1) {
      this.middlewares.splice(index, 1);
    }
  }

  // ============================================================================
  // プライベートメソッド
  // ============================================================================

  /**
   * リスナーを追加
   * @param eventType - イベントタイプ
   * @param handler - イベントハンドラー
   * @param options - オプション
   * @returns 購読解除関数
   */
  private addListener<T = any>(
    eventType: string,
    handler: EventHandler<T>,
    options: Partial<EventListener<T>> = {}
  ): UnsubscribeFunction {
    // リスナー数の制限チェック
    const currentCount = this.listenerCount(eventType);
    if (currentCount >= this.maxListeners) {
      const error = new Error(
        `Maximum number of listeners (${this.maxListeners}) exceeded for event: ${eventType}`
      );
      this.handleError(error, eventType);
      throw error;
    }

    // リスナーオブジェクトを作成
    const listener: EventListener<T> = {
      handler,
      once: options.once ?? false,
      priority: options.priority ?? 0,
      enabled: options.enabled ?? true,
    };

    // リスナー配列を取得または作成
    let listeners = this.listeners.get(eventType);
    if (!listeners) {
      listeners = [];
      this.listeners.set(eventType, listeners);
    }

    // 優先度順に挿入
    const insertIndex = listeners.findIndex(
      l => l.priority < listener.priority
    );
    if (insertIndex === -1) {
      listeners.push(listener);
    } else {
      listeners.splice(insertIndex, 0, listener);
    }

    this.log('debug', `Added listener for event: ${eventType}`, {
      priority: listener.priority,
    });

    // 購読解除関数を返す
    return () => {
      this.off(eventType, handler);
    };
  }

  /**
   * リスナーを実行
   * @param eventType - イベントタイプ
   * @param data - イベントデータ
   */
  private executeListeners<T = any>(eventType: string, data?: T): void {
    const listeners = this.listeners.get(eventType);
    if (!listeners || listeners.length === 0) {
      return;
    }

    // 一度だけ実行されるリスナーを記録
    const onceListeners: EventListener<T>[] = [];

    // リスナーを順番に実行
    for (const listener of listeners) {
      if (!listener.enabled) {
        continue;
      }

      try {
        // 非同期実行
        const result = listener.handler(data);
        if (result instanceof Promise) {
          result.catch(error => {
            this.handleError(error, eventType, data);
          });
        }

        // 一度だけ実行されるリスナーを記録
        if (listener.once) {
          onceListeners.push(listener);
        }
      } catch (error) {
        this.handleError(error as Error, eventType, data);
      }
    }

    // 一度だけ実行されるリスナーを削除
    for (const onceListener of onceListeners) {
      this.off(eventType, onceListener.handler);
    }
  }

  /**
   * ミドルウェアを適用
   * @param eventType - イベントタイプ
   * @param data - イベントデータ
   * @param next - 次の処理
   */
  private applyMiddlewares(
    eventType: string,
    data: any,
    next: () => void
  ): void {
    let index = 0;

    const executeMiddleware = () => {
      if (index >= this.middlewares.length) {
        next();
        return;
      }

      const middleware = this.middlewares[index++];
      if (middleware) {
        try {
          middleware(eventType, data, executeMiddleware);
        } catch (error) {
          this.handleError(error as Error, eventType, data);
        }
      }
    };

    executeMiddleware();
  }

  /**
   * エラーハンドリング
   * @param error - エラーオブジェクト
   * @param eventType - イベントタイプ
   * @param data - イベントデータ
   */
  private handleError(error: Error, eventType: string, data?: any): void {
    this.log(
      'error',
      `Error in event handler for ${eventType}: ${error.message}`,
      {
        error: error.stack,
        data,
      }
    );

    if (this.errorHandler) {
      try {
        this.errorHandler(error, eventType, data);
      } catch (handlerError) {
        this.log('error', 'Error in error handler', handlerError);
      }
    }

    // エラーイベントを発行（無限ループを避けるため、同じイベントでない場合のみ）
    if (eventType !== 'error') {
      this.emit('error', { error, eventType, data });
    }
  }

  /**
   * ログ出力
   * @param level - ログレベル
   * @param message - メッセージ
   * @param data - 追加データ
   */
  private log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: any
  ): void {
    if (!this.debug && level === 'debug') {
      return;
    }

    if (this.logger) {
      this.logger(level, message, data);
    } else if (typeof console !== 'undefined') {
      const logMethod = console[level] || console.log;
      if (data !== undefined) {
        logMethod(`[EventEmitter] ${message}`, data);
      } else {
        logMethod(`[EventEmitter] ${message}`);
      }
    }
  }
}

// ============================================================================
// 型安全なEventEmitterの実装
// ============================================================================

/**
 * 型安全なイベントエミッター
 * 特定のイベントマップに基づいて型安全性を提供
 */
export class TypedEventEmitterImpl<TEventMap = TypedEventMap> {
  /** 内部EventEmitterインスタンス */
  private emitter: EventEmitter;

  /**
   * コンストラクタ
   * @param config - EventBusの設定
   */
  constructor(config?: Partial<EventBusConfig>) {
    this.emitter = new EventEmitter(config);
  }

  /**
   * 型安全なイベント発行
   * @param eventType - イベントタイプ
   * @param data - イベントデータ
   */
  emit<K extends keyof TEventMap>(eventType: K, data: TEventMap[K]): void {
    this.emitter.emit(eventType as string, data);
  }

  /**
   * 型安全なイベントリスナー登録
   * @param eventType - イベントタイプ
   * @param handler - イベントハンドラー
   * @returns 購読解除関数
   */
  on<K extends keyof TEventMap>(
    eventType: K,
    handler: EventHandler<TEventMap[K]>
  ): UnsubscribeFunction {
    return this.emitter.on(eventType as string, handler);
  }

  /**
   * 型安全な一度だけ実行されるイベントリスナー登録
   * @param eventType - イベントタイプ
   * @param handler - イベントハンドラー
   * @returns 購読解除関数
   */
  once<K extends keyof TEventMap>(
    eventType: K,
    handler: EventHandler<TEventMap[K]>
  ): UnsubscribeFunction {
    return this.emitter.once(eventType as string, handler);
  }

  /**
   * 型安全なイベントリスナー削除
   * @param eventType - イベントタイプ
   * @param handler - 削除するハンドラー
   */
  off<K extends keyof TEventMap>(
    eventType: K,
    handler?: EventHandler<TEventMap[K]>
  ): void {
    this.emitter.off(eventType as string, handler);
  }

  /**
   * 内部のEventEmitterにアクセス
   * @returns EventEmitterインスタンス
   */
  getEmitter(): EventEmitter {
    return this.emitter;
  }
}

// ============================================================================
// 高度な機能を持つEventBus
// ============================================================================

/**
 * 高度な機能を持つイベントバス
 * スロットリング、デバウンス、フィルタリング機能を提供
 */
export class AdvancedEventBus extends EventEmitter {
  /** スロットリング・デバウンス管理 */
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /** フィルター関数 */
  private filters: Map<string, (data: any) => boolean> = new Map();

  /**
   * 高度なイベントリスナー登録
   * @param eventType - イベントタイプ
   * @param handler - イベントハンドラー
   * @param options - 購読オプション
   * @returns 購読解除関数
   */
  onAdvanced<T = any>(
    eventType: string,
    handler: EventHandler<T>,
    options: SubscriptionOptions = {}
  ): UnsubscribeFunction {
    let wrappedHandler = handler;

    // フィルター適用
    if (options.filter) {
      const originalHandler = wrappedHandler;
      wrappedHandler = (data: T) => {
        if (options.filter!(data)) {
          originalHandler(data);
        }
      };
    }

    // スロットリング適用
    if (options.throttle) {
      const originalHandler = wrappedHandler;
      const throttleKey = `${eventType}_${Date.now()}_${Math.random()}`;

      wrappedHandler = (data: T) => {
        if (!this.timers.has(throttleKey)) {
          originalHandler(data);
          this.timers.set(
            throttleKey,
            setTimeout(() => {
              this.timers.delete(throttleKey);
            }, options.throttle!)
          );
        }
      };
    }

    // デバウンス適用
    if (options.debounce) {
      const originalHandler = wrappedHandler;
      const debounceKey = `${eventType}_${Date.now()}_${Math.random()}`;

      wrappedHandler = (data: T) => {
        const existingTimer = this.timers.get(debounceKey);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        this.timers.set(
          debounceKey,
          setTimeout(() => {
            originalHandler(data);
            this.timers.delete(debounceKey);
          }, options.debounce!)
        );
      };
    }

    // 基本のリスナー登録
    const listenerOptions: Partial<EventListener<T>> = {};
    if (options.once !== undefined) {
      listenerOptions.once = options.once;
    }
    if (options.priority !== undefined) {
      listenerOptions.priority = options.priority;
    }

    const unsubscribe = this.on(eventType, wrappedHandler, listenerOptions);

    // 購読解除時にタイマーもクリア
    return () => {
      unsubscribe();
      // 関連するタイマーをクリア
      for (const [key, timer] of this.timers.entries()) {
        if (key.startsWith(eventType)) {
          clearTimeout(timer);
          this.timers.delete(key);
        }
      }
    };
  }

  /**
   * イベントフィルターを設定
   * @param eventType - イベントタイプ
   * @param filter - フィルター関数
   */
  setFilter(eventType: string, filter: (data: any) => boolean): void {
    this.filters.set(eventType, filter);
  }

  /**
   * イベントフィルターを削除
   * @param eventType - イベントタイプ
   */
  removeFilter(eventType: string): void {
    this.filters.delete(eventType);
  }

  /**
   * 全てのタイマーをクリア（クリーンアップ用）
   */
  cleanup(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.removeAllListeners();
  }
}

// ============================================================================
// グローバルEventBusインスタンス
// ============================================================================

/** グローバルイベントバス（シングルトンパターン） */
export const globalEventBus = new AdvancedEventBus({
  maxListeners: 1000,
  debug: process.env.NODE_ENV === 'development',
  errorHandler: (error, eventType, data) => {
    console.error(`[GlobalEventBus] Error in ${eventType}:`, error, data);
  },
  logger: (level, message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console[level](`[GlobalEventBus] ${message}`, data || '');
    }
  },
});

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * EventEmitterのファクトリー関数
 * @param config - 設定
 * @returns EventEmitterインスタンス
 */
export function createEventEmitter(
  config?: Partial<EventBusConfig>
): EventEmitter {
  return new EventEmitter(config);
}

/**
 * 型安全なEventEmitterのファクトリー関数
 * @param config - 設定
 * @returns TypedEventEmitterImplインスタンス
 */
export function createTypedEventEmitter<TEventMap = TypedEventMap>(
  config?: Partial<EventBusConfig>
): TypedEventEmitterImpl<TEventMap> {
  return new TypedEventEmitterImpl<TEventMap>(config);
}

/**
 * 高度なEventBusのファクトリー関数
 * @param config - 設定
 * @returns AdvancedEventBusインスタンス
 */
export function createAdvancedEventBus(
  config?: Partial<EventBusConfig>
): AdvancedEventBus {
  return new AdvancedEventBus(config);
}

/**
 * 一度だけ実行されるイベントのPromise化
 * @param emitter - EventEmitterインスタンス
 * @param eventType - イベントタイプ
 * @param timeout - タイムアウト時間（ミリ秒）
 * @returns イベントデータのPromise
 */
export function waitForEvent<T = any>(
  emitter: EventEmitter,
  eventType: string,
  timeout?: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | undefined;

    const unsubscribe = emitter.once(eventType, (data: T) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      resolve(data);
    });

    if (timeout) {
      timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Event ${eventType} timeout after ${timeout}ms`));
      }, timeout);
    }
  });
}

/**
 * 複数のイベントを並行して待機
 * @param emitter - EventEmitterインスタンス
 * @param eventTypes - イベントタイプの配列
 * @param timeout - タイムアウト時間（ミリ秒）
 * @returns 最初に発生したイベントのPromise
 */
export function waitForAnyEvent<T = any>(
  emitter: EventEmitter,
  eventTypes: string[],
  timeout?: number
): Promise<{ eventType: string; data: T }> {
  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | undefined;
    const unsubscribeFunctions: UnsubscribeFunction[] = [];

    const cleanup = () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    eventTypes.forEach(eventType => {
      const unsubscribe = emitter.once(eventType, (data: T) => {
        cleanup();
        resolve({ eventType, data });
      });
      unsubscribeFunctions.push(unsubscribe);
    });

    if (timeout) {
      timeoutId = setTimeout(() => {
        cleanup();
        reject(
          new Error(
            `Events ${eventTypes.join(', ')} timeout after ${timeout}ms`
          )
        );
      }, timeout);
    }
  });
}
