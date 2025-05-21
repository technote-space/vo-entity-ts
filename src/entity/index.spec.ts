import { describe, expect, it } from 'vitest';
import type { ValidationException } from '../exceptions/validation.js';
import { Text } from '../valueObject/text.js';
import { Entity } from './index.js';

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
  protected constructor(
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

  public update({ text3, text4 }: { text3?: Text; text4?: Text }): TestEntity {
    return TestEntity._update(this, this.text1, this.text2, text3, text4);
  }

  public equals(other: TestEntity): boolean {
    return this.text1.equals(other.text1);
  }
}

// biome-ignore lint/suspicious/noExportsInTest:
export class TestEntityWithEntity extends Entity {
  protected constructor(
    public readonly text: Text,
    public readonly entity: TestEntity,
  ) {
    super();
  }

  public static create(text: Text, entity: TestEntity): TestEntityWithEntity {
    return TestEntityWithEntity._create(text, entity);
  }

  public static reconstruct(
    text: Text,
    entity: TestEntity,
  ): TestEntityWithEntity {
    return TestEntityWithEntity._reconstruct(text, entity);
  }

  public update({ text, entity }: { text?: Text; entity?: TestEntity }) {
    return TestEntityWithEntity._update(
      this,
      text ?? this.text,
      entity ?? this.entity,
    );
  }

  public equals(other: TestEntityWithEntity): boolean {
    return this.text.equals(other.text) && this.entity.equals(other.entity);
  }
}

describe('Entity', () => {
  describe('equals', () => {
    it('should return true', () => {
      expect(
        TestEntity.reconstruct(
          new TestText(1),
          new TestText(2),
          new TestText(3),
          new TestText(4),
        ).equals(
          TestEntity.reconstruct(
            new TestText(1),
            new TestText(2),
            new TestText(3),
            new TestText(4),
          ),
        ),
      ).toBe(true);
      expect(
        TestEntity.reconstruct(
          new TestText(1),
          new TestText(2),
          new TestText(3),
          new TestText(4),
        ).equals(
          TestEntity.reconstruct(
            new TestText(1),
            new TestText(0),
            new TestText(0),
            new TestText(0),
          ),
        ),
      ).toBe(true);
    });

    it('should return false', () => {
      expect(
        TestEntity.reconstruct(
          new TestText(1),
          new TestText(2),
          new TestText(3),
          new TestText(4),
        ).equals(
          TestEntity.reconstruct(
            new TestText(0),
            new TestText(2),
            new TestText(3),
            new TestText(4),
          ),
        ),
      ).toBe(false);
    });
  });

  describe('create', () => {
    it('should not throw error', () => {
      expect(() =>
        TestEntity.create(new TestText(1), new TestText('1')),
      ).not.toThrow();
    });

    it('should throw error', () => {
      let error: ValidationException | undefined;
      try {
        TestEntity.create(new TestText(1), new TestText(''));
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
          new TestText(1),
          new TestText(''),
          new TestText(1),
          new TestText('abcdef'),
        ),
      ).not.toThrow();
    });
  });

  describe('update', () => {
    it('should not throw error', () => {
      const test = TestEntity.create(new TestText(1), new TestText('1')).update(
        {
          text3: new TestText(1),
          text4: new TestText('abcde'),
        },
      );

      expect(test.text3?.value).toBe('1');
      expect(test.text4?.value).toBe('abcde');
    });

    it('should throw error', () => {
      const test = TestEntity.create(new TestText(1), new TestText('1'));

      let error: ValidationException | undefined;
      try {
        test.update({
          text3: new TestText(1),
          text4: new TestText('abcdef'),
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

  describe('Entity with Entity argument', () => {
    it('should create entity with entity argument', () => {
      const text = new TestText(1);
      const entity = TestEntity.reconstruct(new TestText(1), new TestText('1'));
      const result = TestEntityWithEntity.create(text, entity);

      expect(result.text.value).toBe('1');
      expect(result.entity.text1.value).toBe('1');
      expect(result.entity.text2.value).toBe('1');
      expect(result.entity.text3?.value).toBeUndefined();
      expect(result.entity.text4?.value).toBeUndefined();
    });

    it('should reconstruct entity with entity argument', () => {
      const text = new TestText(1);
      const entity = TestEntity.reconstruct(
        new TestText(1),
        new TestText('1'),
        new TestText(3),
        new TestText(4),
      );
      const result = TestEntityWithEntity.reconstruct(text, entity);

      expect(result.text.value).toBe('1');
      expect(result.entity.text1.value).toBe('1');
      expect(result.entity.text2.value).toBe('1');
      expect(result.entity.text3?.value).toBe('3');
      expect(result.entity.text4?.value).toBe('4');
    });

    it('should update entity with entity argument', () => {
      const text = new TestText(1);
      const entity = TestEntity.create(new TestText(1), new TestText('1'));
      const test = TestEntityWithEntity.create(text, entity);

      const newText = new TestText(2);
      const newEntity = TestEntity.create(new TestText(2), new TestText('2'));
      const result = test.update({ text: newText, entity: newEntity });

      expect(result.text.value).toBe('2');
      expect(result.entity.text1.value).toBe('2');
      expect(result.entity.text2.value).toBe('2');
      expect(result.entity.text3?.value).toBeUndefined();
      expect(result.entity.text4?.value).toBeUndefined();
    });

    it('should validate nested entity errors', () => {
      let error: ValidationException | undefined;
      try {
        TestEntityWithEntity.create(
          new TestText(1),
          TestEntity.reconstruct(new TestText(1), new TestText('')),
        );
      } catch (e) {
        error = e as ValidationException;
      }

      expect(error).not.toBeUndefined();
      expect(error?.message).toBe('バリデーションエラーが発生しました');
      expect(error?.errors).toEqual({
        'entity.text2': ['値を指定してください'],
      });
    });

    it('should validate nested entity errors on update', () => {
      const text = new TestText(1);
      const entity = TestEntity.create(new TestText(1), new TestText('1'));
      const test = TestEntityWithEntity.create(text, entity);

      let error: ValidationException | undefined;
      try {
        test.update({
          entity: TestEntity.reconstruct(new TestText(1), new TestText('')),
        });
      } catch (e) {
        error = e as ValidationException;
      }

      expect(error).not.toBeUndefined();
      expect(error?.message).toBe('バリデーションエラーが発生しました');
      expect(error?.errors).toEqual({
        'entity.text2': ['値を指定してください'],
      });
    });
  });
});
