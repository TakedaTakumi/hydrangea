/**
 * UUIDv7 ID生成機能のテスト（Bun内蔵テストランナー版）
 * IdGeneratorクラスの各種ID生成メソッドをテスト
 */

import { test, expect, describe } from 'bun:test';
import { IdGenerator } from '../src/utils/helpers';

describe('IdGenerator - UUIDv7 機能', () => {
  describe('generateUuidV7Id()', () => {
    test('デフォルトでnode_プレフィックス付きのUUIDv7形式の文字列を返す', () => {
      const id = IdGenerator.generateUuidV7Id();

      expect(id).toMatch(
        /^node_[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
      expect(id.startsWith('node_')).toBe(true);
    });

    test('指定したプレフィックス付きのUUIDv7形式の文字列を返す', () => {
      const id = IdGenerator.generateUuidV7Id('test');

      expect(id).toMatch(
        /^test_[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
      expect(id.startsWith('test_')).toBe(true);
    });

    test('連続して呼び出しても常に異なるIDを返す', () => {
      const ids = new Set();
      for (let i = 0; i < 10; i++) {
        ids.add(IdGenerator.generateUuidV7Id());
      }
      expect(ids.size).toBe(10);
    });
  });

  describe('generateShortUuidV7Id()', () => {
    test('デフォルトでnode_プレフィックス付きの8桁短縮UUIDv7を返す', () => {
      const id = IdGenerator.generateShortUuidV7Id();

      expect(id).toMatch(/^node_[0-9a-f]{8}$/);
      expect(id.startsWith('node_')).toBe(true);
      expect(id.length).toBe(13); // 'node_' + 8文字
    });

    test('指定したプレフィックス付きの8桁短縮UUIDv7を返す', () => {
      const id = IdGenerator.generateShortUuidV7Id('short');

      expect(id).toMatch(/^short_[0-9a-f]{8}$/);
      expect(id.startsWith('short_')).toBe(true);
    });
  });

  describe('generatePureUuidV7()', () => {
    test('プレフィックスなしの標準UUIDv7形式の文字列を返す', () => {
      const id = IdGenerator.generatePureUuidV7();

      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
      expect(id.includes('_')).toBe(false);
    });

    test('生成されたUUIDのバージョンフィールドは7である', () => {
      const id = IdGenerator.generatePureUuidV7();
      const versionChar = id.charAt(14); // バージョン位置

      expect(versionChar).toBe('7');
    });

    test('生成されたUUIDのバリアントフィールドは8,9,a,bのいずれかである', () => {
      const id = IdGenerator.generatePureUuidV7();
      const variantChar = id.charAt(19); // バリアント位置

      expect(['8', '9', 'a', 'b']).toContain(variantChar);
    });
  });

  describe('フォーマット検証', () => {
    test('isUuidV7Format()は有効なUUIDv7形式の文字列に対してtrueを返す', () => {
      const validIds = [
        IdGenerator.generatePureUuidV7(),
        IdGenerator.generateUuidV7Id(),
        'node_01932b9d-8e2a-7123-8456-123456789abc',
        '01932b9d-8e2a-7123-8456-123456789abc',
      ];

      validIds.forEach(id => {
        expect(IdGenerator.isUuidV7Format(id)).toBe(true);
      });
    });

    test('isUuidV7Format()は無効な形式の文字列に対してfalseを返す', () => {
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

  describe('タイムスタンプ操作', () => {
    test('extractTimestamp()は有効なUUIDv7からタイムスタンプ（ミリ秒）を抽出して返す', () => {
      const id = IdGenerator.generatePureUuidV7();
      const extracted = IdGenerator.extractTimestamp(id);
      const currentTime = Date.now();

      expect(extracted).toBeLessThanOrEqual(currentTime);
      expect(extracted).toBeGreaterThan(currentTime - 1000); // 1秒以内
    });

    test('extractTimestamp()はプレフィックス付きUUIDv7からもタイムスタンプを正しく抽出する', () => {
      const id = IdGenerator.generateUuidV7Id();
      const extracted = IdGenerator.extractTimestamp(id);

      expect(typeof extracted).toBe('number');
      expect(extracted).toBeGreaterThan(0);
    });

    test('extractTimestamp()は無効な文字列に対してnullを返す', () => {
      const invalidIds = ['invalid-id', 'node_invalid', ''];

      invalidIds.forEach(id => {
        expect(IdGenerator.extractTimestamp(id)).toBeNull();
      });
    });
  });

  describe('デフォルト生成メソッド', () => {
    test('generate()はgenerateUuidV7Id()と同じ形式の文字列を返す', () => {
      const id = IdGenerator.generate();

      expect(IdGenerator.isUuidV7Format(id)).toBe(true);
      expect(id.startsWith('node_')).toBe(true);
    });
  });

  describe('一意性とパフォーマンス', () => {
    test('1000回連続生成しても全て異なるIDが生成される', () => {
      const ids = new Set();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        ids.add(IdGenerator.generateUuidV7Id());
      }

      expect(ids.size).toBe(count);
    });

    test('100回のID生成が100ms以内に完了する', () => {
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
    test('同一ミリ秒内で連続生成しても異なるIDが生成される', () => {
      const ids = new Set();
      for (let i = 0; i < 10; i++) {
        ids.add(IdGenerator.generateUuidV7Id());
      }

      expect(ids.size).toBe(10);
    });
  });
});
