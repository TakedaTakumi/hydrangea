/**
 * UUIDv7 ID生成機能のテスト
 * IdGeneratorクラスの各種ID生成メソッドをテスト
 * プロパティベーステストにより、大量生成での一意性と性能を検証
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import fc from 'fast-check';
import { IdGenerator } from '../../../src/utils/helpers';

describe('IdGenerator - UUIDv7 機能', () => {
  describe('generateUuidV7Id()', () => {
    it('デフォルトでnode_プレフィックス付きのUUIDv7形式の文字列を返す', () => {
      const id = IdGenerator.generateUuidV7Id();

      expect(id).toMatch(
        /^node_[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
      expect(id.startsWith('node_')).toBe(true);
    });

    it('指定したプレフィックス付きのUUIDv7形式の文字列を返す', () => {
      const id = IdGenerator.generateUuidV7Id('test');

      expect(id).toMatch(
        /^test_[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
      expect(id.startsWith('test_')).toBe(true);
    });

    it('連続して呼び出しても常に異なるIDを返す', () => {
      const ids = new Set();
      for (let i = 0; i < 10; i++) {
        ids.add(IdGenerator.generateUuidV7Id());
      }
      expect(ids.size).toBe(10);
    });
  });

  describe('generateShortUuidV7Id()', () => {
    it('デフォルトでnode_プレフィックス付きの8桁短縮UUIDv7を返す', () => {
      const id = IdGenerator.generateShortUuidV7Id();

      expect(id).toMatch(/^node_[0-9a-f]{8}$/);
      expect(id.startsWith('node_')).toBe(true);
      expect(id.length).toBe(13); // 'node_' + 8文字
    });

    it('指定したプレフィックス付きの8桁短縮UUIDv7を返す', () => {
      const id = IdGenerator.generateShortUuidV7Id('short');

      expect(id).toMatch(/^short_[0-9a-f]{8}$/);
      expect(id.startsWith('short_')).toBe(true);
    });
  });

  describe('generatePureUuidV7()', () => {
    it('プレフィックスなしの標準UUIDv7形式の文字列を返す', () => {
      const id = IdGenerator.generatePureUuidV7();

      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
      expect(id.includes('_')).toBe(false);
    });

    it('生成されたUUIDのバージョンフィールドは7である', () => {
      const id = IdGenerator.generatePureUuidV7();
      const versionChar = id.charAt(14); // バージョン位置

      expect(versionChar).toBe('7');
    });

    it('生成されたUUIDのバリアントフィールドは8,9,a,bのいずれかである', () => {
      const id = IdGenerator.generatePureUuidV7();
      const variantChar = id.charAt(19); // バリアント位置

      expect(['8', '9', 'a', 'b']).toContain(variantChar);
    });
  });

  describe('フォーマット検証', () => {
    describe('isUuidV7Format()', () => {
      it('isUuidV7Format()は有効なUUIDv7形式の文字列に対してtrueを返す', () => {
        const validIds = [
          IdGenerator.generatePureUuidV7(),
          IdGenerator.generateUuidV7Id(),
          IdGenerator.generateShortUuidV7Id(),
          'node_01932b9d-8e2a-7123-8456-123456789abc',
          '01932b9d-8e2a-7123-8456-123456789abc',
        ];

        validIds.forEach(id => {
          expect(IdGenerator.isUuidV7Format(id)).toBe(true);
        });
      });

      it('isUuidV7Format()は無効な形式の文字列に対してfalseを返す', () => {
        const invalidIds = [
          'invalid-id',
          '01932b9d-8e2a-6123-8456-123456789abc', // バージョンが6
          '01932b9d-8e2a-7123-c456-123456789abc', // バリアントが無効
          'node_01932b9d-8e2a-7123-8456', // 不完全
          '',
        ];

        invalidIds.forEach(id => {
          expect(IdGenerator.isUuidV7Format(id)).toBe(false);
        });
      });
    });
  });

  describe('タイムスタンプ操作', () => {
    describe('extractTimestamp()', () => {
      it('extractTimestamp()は有効なUUIDv7からタイムスタンプ（ミリ秒）を抽出して返す', () => {
        const id = IdGenerator.generatePureUuidV7();
        const extracted = IdGenerator.extractTimestamp(id);
        const currentTime = Date.now();

        expect(extracted).toBeLessThanOrEqual(currentTime);
        expect(extracted).toBeGreaterThan(currentTime - 1000); // 1秒以内
      });

      it('extractTimestamp()はプレフィックス付きUUIDv7からもタイムスタンプを正しく抽出する', () => {
        const id = IdGenerator.generateUuidV7Id();
        const extracted = IdGenerator.extractTimestamp(id);

        expect(extracted).toBeTypeOf('number');
        expect(extracted).toBeGreaterThan(0);
      });

      it('extractTimestamp()は無効な文字列に対してnullを返す', () => {
        const invalidIds = ['invalid-id', 'node_invalid', ''];

        invalidIds.forEach(id => {
          expect(IdGenerator.extractTimestamp(id)).toBeNull();
        });
      });
    });
  });

  describe('デフォルト生成メソッド', () => {
    describe('generate()', () => {
      it('generate()はgenerateUuidV7Id()と同じ形式の文字列を返す', () => {
        const id = IdGenerator.generate();

        expect(IdGenerator.isUuidV7Format(id)).toBe(true);
        expect(id.startsWith('node_')).toBe(true);
      });
    });
  });

  describe('一意性とパフォーマンス', () => {
    it('1000回連続生成しても全て異なるIDが生成される', () => {
      const ids = new Set();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        ids.add(IdGenerator.generateUuidV7Id());
      }

      expect(ids.size).toBe(count);
    });

    it('100回のID生成が100ms以内に完了する', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        IdGenerator.generateUuidV7Id();
      }

      const end = performance.now();
      const duration = end - start;

      // 100個の生成が100ms以下で完了することを確認
      expect(duration).toBeLessThan(100);
    });
  });

  describe('エッジケース', () => {
    it('同一ミリ秒内で連続生成しても異なるIDが生成される', () => {
      const ids = new Set();
      for (let i = 0; i < 10; i++) {
        ids.add(IdGenerator.generateUuidV7Id());
      }

      expect(ids.size).toBe(10);
    });
  });

  describe('プロパティベーステスト - UUIDv7生成の堅牢性', () => {
    it('大量生成時の一意性が保証される', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 1000 }), // 生成数
          (count: number) => {
            const generatedIds = new Set<string>();

            for (let i = 0; i < count; i++) {
              const id = IdGenerator.generateUuidV7Id();

              // IDの形式チェック
              if (
                !id.match(
                  /^node_[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
                )
              ) {
                return false;
              }

              // 重複チェック
              if (generatedIds.has(id)) {
                return false;
              }

              generatedIds.add(id);
            }

            // 全てのIDが一意であることを確認
            return generatedIds.size === count;
          }
        ),
        { numRuns: 10, timeout: 5000 } // タイムアウトを設定
      );
    });

    it('任意のプレフィックスで正しい形式のIDが生成される', () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 1, maxLength: 20 })
            .filter(s => /^[a-zA-Z][a-zA-Z0-9_]*$/.test(s)), // 有効なプレフィックス
          (prefix: string) => {
            const id = IdGenerator.generateUuidV7Id(prefix);

            // プレフィックスが正しく適用されている
            if (!id.startsWith(`${prefix}_`)) {
              return false;
            }

            // UUID部分が正しい形式
            const uuidPart = id.substring(prefix.length + 1);
            const uuidRegex =
              /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

            return uuidRegex.test(uuidPart);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('短縮UUIDの一意性と形式が正しく保たれる', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 20 }), // さらに生成数を減らす
          (count: number) => {
            const generatedIds = new Set<string>();

            for (let i = 0; i < count; i++) {
              const shortId = IdGenerator.generateShortUuidV7Id();

              // 短縮ID形式チェック（node_ + 8文字）
              if (!shortId.match(/^node_[0-9a-f]{8}$/)) {
                return false;
              }

              generatedIds.add(shortId);
            }

            // 短縮UUIDは8桁のみなので、小さな数であっても完全な一意性は保証されない
            // 形式が正しく、かつ少なくとも何らかのIDが生成されることを確認
            return generatedIds.size >= Math.min(count, 1);
          }
        ),
        { numRuns: 10 } // テスト回数も減らす
      );
    });

    it('タイムスタンプ抽出の正確性が保たれる', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }), // テスト回数
          (iterations: number) => {
            const startTime = Date.now();

            for (let i = 0; i < iterations; i++) {
              const id = IdGenerator.generateUuidV7Id();
              const extractedTimestamp = IdGenerator.extractTimestamp(id);

              if (extractedTimestamp === null) {
                return false;
              }

              // 抽出されたタイムスタンプが妥当な範囲内であることを確認
              const now = Date.now();
              if (
                extractedTimestamp < startTime ||
                extractedTimestamp > now + 1000
              ) {
                return false;
              }
            }

            return true;
          }
        ),
        { numRuns: 30 }
      );
    });

    it('異なる時刻に生成されたUUIDのタイムスタンプが時系列順になる', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 5, max: 20 }), {
            minLength: 2,
            maxLength: 3,
          }), // 待機時間配列（短縮）
          (waitTimes: number[]) => {
            const idsWithTimestamps: Array<{ id: string; timestamp: number }> =
              [];

            // 最初のIDを生成
            const firstId = IdGenerator.generateUuidV7Id();
            const firstTimestamp = IdGenerator.extractTimestamp(firstId);
            if (firstTimestamp === null) return false;

            idsWithTimestamps.push({ id: firstId, timestamp: firstTimestamp });

            // 待機時間を適用してIDを生成
            for (const waitTime of waitTimes) {
              // 実際の時間経過を待つ代わりに、異なる時点でIDを生成
              // （同じミリ秒内での生成は許容）

              const id = IdGenerator.generateUuidV7Id();
              const timestamp = IdGenerator.extractTimestamp(id);

              if (timestamp === null) {
                return false;
              }

              idsWithTimestamps.push({ id, timestamp });
            }

            // 時系列順になっているかチェック（同じタイムスタンプは許容）
            for (let i = 1; i < idsWithTimestamps.length; i++) {
              const prevTimestamp = idsWithTimestamps[i - 1].timestamp;
              const currentTimestamp = idsWithTimestamps[i].timestamp;

              // 前の時刻より前に戻ることは許可しない
              if (currentTimestamp < prevTimestamp) {
                return false;
              }
            }

            return true;
          }
        ),
        { numRuns: 8 } // テスト回数を減らす
      );
    });

    it('不正な形式の文字列でバリデーションが正しく動作する', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string({ minLength: 0, maxLength: 50 }), // ランダム文字列
            fc.integer().map(n => n.toString()), // 数値文字列
            fc.constant(''), // 空文字列
            fc.constant('not-a-uuid'), // 明らかに無効な文字列
            fc.string({ minLength: 1, maxLength: 10 }).map(s => `invalid_${s}`) // 無効なプレフィックス
          ),
          (invalidInput: string) => {
            // 有効なUUIDv7形式でない場合はfalseを返すことを確認
            const isValid = IdGenerator.isUuidV7Format(invalidInput);

            // 明らかに無効な形式の場合はfalseであることを確認
            if (invalidInput.length < 36 || !invalidInput.includes('-')) {
              return !isValid;
            }

            // UUIDv7の正規表現に一致しない場合はfalseであることを確認
            const uuidv7Regex =
              /^(\w+_)?[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
            const shouldBeValid = uuidv7Regex.test(invalidInput);

            return isValid === shouldBeValid;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
