import { describe, expect, it } from 'vitest';
import type ValidationException from '../exceptions/validation.js';
import Text from '../valueObject/text.js';
import Entity from './index.js';

// biome-ignore lint/suspicious/noExportsInTest:
export class TestText extends Text {
  protected get symbol() {
    return Symbol();
  }

  protected override getValidationMaxLength(): number | undefined {
    return 5;
  }
}

// biome-ignore lint/suspicious/noExportsInTest:
export class TestEntity extends Entity {
  /**
   * @deprecated create or reconstruct 経由で生成
   */
  public constructor(
    public readonly text1: Text,
    public readonly text2: Text,
    public readonly text3?: Text,
    public readonly text4?: Text,
  ) {
    super();
  }

  public static create(text1: Text, text2: Text): TestEntity {
    return TestEntity._create(text1, text2);
  }

  public static reconstruct(
    text1: Text,
    text2: Text,
    text3?: Text,
    text4?: Text,
  ): TestEntity {
    return TestEntity._reconstruct(text1, text2, text3, text4);
  }

  public update({ text3, text4 }: { text3?: Text; text4?: Text }) {
    return TestEntity._update(this, this.text1, this.text2, text3, text4);
  }

  public equals(other: TestEntity): boolean {
    return this.text1.equals(other.text1);
  }
}

describe('Entity', () => {
  it('should throw error if call constructor directory', () => {
    expect(
      () =>
        new TestEntity(
          TestText.create(1),
          TestText.create(2),
          TestText.create(3),
          TestText.create(4),
        ),
    ).toThrow();
  });

  describe('equals', () => {
    it('should return true', () => {
      expect(
        TestEntity.reconstruct(
          TestText.create(1),
          TestText.create(2),
          TestText.create(3),
          TestText.create(4),
        ).equals(
          TestEntity.reconstruct(
            TestText.create(1),
            TestText.create(2),
            TestText.create(3),
            TestText.create(4),
          ),
        ),
      ).toBe(true);
      expect(
        TestEntity.reconstruct(
          TestText.create(1),
          TestText.create(2),
          TestText.create(3),
          TestText.create(4),
        ).equals(
          TestEntity.reconstruct(
            TestText.create(1),
            TestText.create(0),
            TestText.create(0),
            TestText.create(0),
          ),
        ),
      ).toBe(true);
    });

    it('should return false', () => {
      expect(
        TestEntity.reconstruct(
          TestText.create(1),
          TestText.create(2),
          TestText.create(3),
          TestText.create(4),
        ).equals(
          TestEntity.reconstruct(
            TestText.create(0),
            TestText.create(2),
            TestText.create(3),
            TestText.create(4),
          ),
        ),
      ).toBe(false);
    });
  });

  describe('create', () => {
    it('should not throw error', () => {
      expect(() =>
        TestEntity.create(TestText.create(1), TestText.create('1')),
      ).not.toThrow();
    });

    it('should throw error', () => {
      let error: ValidationException | undefined;
      try {
        TestEntity.create(TestText.create(1), TestText.create(''));
      } catch (e) {
        error = e as ValidationException;
      }

      expect(error).not.toBeUndefined();
      expect(error?.message).toBe('バリデーションエラーが発生しました');
      expect(error?.errors).toEqual({
        text2: ['値を指定してください'],
      });
    });
  });

  describe('reconstruct', () => {
    it('should not throw error', () => {
      expect(() =>
        TestEntity.reconstruct(
          TestText.create(1),
          TestText.create(''),
          TestText.create(1),
          TestText.create('abcdef'),
        ),
      ).not.toThrow();
    });
  });

  describe('update', () => {
    it('should not throw error', () => {
      const test = TestEntity.create(
        TestText.create(1),
        TestText.create('1'),
      ).update({
        text3: TestText.create(1),
        text4: TestText.create('abcde'),
      });

      expect(test.text3?.value).toBe('1');
      expect(test.text4?.value).toBe('abcde');
    });

    it('should throw error', () => {
      const test = TestEntity.create(TestText.create(1), TestText.create('1'));

      let error: ValidationException | undefined;
      try {
        test.update({
          text3: TestText.create(1),
          text4: TestText.create('abcdef'),
        });
      } catch (e) {
        error = e as ValidationException;
      }

      expect(error).not.toBeUndefined();
      expect(error?.message).toBe('バリデーションエラーが発生しました');
      expect(error?.errors).toEqual({
        text4: ['5文字より短く入力してください'],
      });
    });
  });
});
