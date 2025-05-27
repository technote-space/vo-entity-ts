import { describe, expect, it } from 'vitest';
import type { ValidationException } from '../exceptions/validation.js';
import { Collection } from '../valueObject/collection.js';
import { Text } from '../valueObject/text.js';
import { Entity } from './index.js';

class TestText extends Text {
  protected get symbol() {
    return Symbol();
  }

  protected override getValidationMaxLength(): number | undefined {
    return 5;
  }
}

class TestTextCollection extends Collection<TestText> {}

type TestEntityProps = {
  text1: Text;
  text2: Text;
  text3?: Text;
  text4?: Text;
  collection?: TestTextCollection;
};
class TestEntity extends Entity<TestEntityProps> {
  protected constructor(props: TestEntityProps) {
    super(props);
  }

  public static create(
    text1: Text,
    text2: Text,
    collection?: TestTextCollection,
  ) {
    return TestEntity._create<TestEntity>({ text1, text2, collection });
  }

  public static reconstruct(
    text1: Text,
    text2: Text,
    text3?: Text,
    text4?: Text,
    collection?: TestTextCollection,
  ) {
    return TestEntity._reconstruct<TestEntity>({
      text1,
      text2,
      text3,
      text4,
      collection,
    });
  }

  public update({
    text3,
    text4,
    collection,
  }: { text3?: Text; text4?: Text; collection?: TestTextCollection }) {
    return TestEntity._update<TestEntity>(this, { text3, text4, collection });
  }

  public equals(other: TestEntity): boolean {
    return this.get('text1').equals(other.get('text1'));
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
        TestEntity.create(
          new TestText(1),
          new TestText(''),
          new TestTextCollection(new TestText(1), new TestText('abcdef')),
        );
      } catch (e) {
        error = e as ValidationException;
      }

      expect(error).not.toBeUndefined();
      expect(error?.message).toBe('バリデーションエラーが発生しました');
      expect(error?.errors).toEqual({
        text2: ['値を指定してください'],
        'collection[1]': ['5文字より短く入力してください'],
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
          new TestTextCollection(new TestText(1), new TestText('2')),
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
          collection: new TestTextCollection(
            new TestText(1),
            new TestText('2'),
          ),
        },
      );

      expect(test.get('text3')?.value).toBe('1');
      expect(test.get('text4')?.value).toBe('abcde');
      expect(test.text3?.value).toBe('1');
      expect(test.text4?.value).toBe('abcde');
      expect(test.collection?.length).toBe(2);
      expect(test.collection?.at(0)?.value).toBe('1');
      expect(test.collection?.at(1)?.value).toBe('2');
    });

    it('should throw error', () => {
      const test = TestEntity.create(
        new TestText(1),
        new TestText('1'),
        new TestTextCollection(new TestText(1), new TestText('2')),
      );

      let error: ValidationException | undefined;
      try {
        test.update({
          text3: new TestText(1),
          text4: new TestText('abcdef'),
          collection: new TestTextCollection(
            new TestText(1),
            new TestText('abcdef'),
          ),
        });
      } catch (e) {
        error = e as ValidationException;
      }

      expect(error).not.toBeUndefined();
      expect(error?.message).toBe('バリデーションエラーが発生しました');
      expect(error?.errors).toEqual({
        text4: ['5文字より短く入力してください'],
        'collection[1]': ['5文字より短く入力してください'],
      });
    });
  });
});

describe('getProps', () => {
  it('should return all properties of the entity', () => {
    const text1 = new TestText(1);
    const text2 = new TestText('2');
    const entity = TestEntity.create(text1, text2);
    const props = entity.getProps();

    expect(props.text1).toBe(text1);
    expect(props.text2).toBe(text2);
    expect(props.text3).toBeUndefined();
    expect(props.text4).toBeUndefined();
    expect(props.collection).toBeUndefined();
  });

  it('should return properties including optional ones when provided', () => {
    const text1 = new TestText(1);
    const text2 = new TestText('2');
    const text3 = new TestText(3);
    const text4 = new TestText('4');
    const collection = new TestTextCollection(
      new TestText(1),
      new TestText('2'),
    );
    const entity = TestEntity.reconstruct(
      text1,
      text2,
      text3,
      text4,
      collection,
    );
    const props = entity.getProps();

    expect(props.text1).toBe(text1);
    expect(props.text2).toBe(text2);
    expect(props.text3).toBe(text3);
    expect(props.text4).toBe(text4);
    expect(props.collection?.length).toBe(2);
    expect(props.collection?.at(0)?.value).toBe('1');
    expect(props.collection?.at(1)?.value).toBe('2');
  });
});

describe('getObject', () => {
  it('should convert ValueObject properties to plain objects', () => {
    const entity = TestEntity.create(
      new TestText(1),
      new TestText('2'),
      new TestTextCollection(new TestText(3), new TestText('4')),
    );
    const result = entity.getObject();

    expect(result).toEqual({
      text1: '1',
      text2: '2',
      collection: ['3', '4'],
    });
  });

  it('should handle undefined properties', () => {
    const entity = TestEntity.reconstruct(
      new TestText(1),
      new TestText('2'),
      undefined,
      undefined,
      undefined,
    );
    const result = entity.getObject();

    expect(result).toEqual({
      text1: '1',
      text2: '2',
      text3: undefined,
      text4: undefined,
      collection: undefined,
    });
  });
});
