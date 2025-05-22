import { describe, expect, it } from 'vitest';
import type { ValidationException } from '../exceptions/validation.js';
import { Text } from '../valueObject/text.js';
import { Collection } from './collection.js';
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
export class TestEntity extends Entity<{
  text1: Text;
  text2: Text;
  text3?: Text;
  text4?: Text;
}> {
  protected constructor(props: {
    text1: Text;
    text2: Text;
    text3?: Text;
    text4?: Text;
  }) {
    super(props);
  }

  public static create(text1: Text, text2: Text): TestEntity {
    return TestEntity._create({ text1, text2 });
  }

  public static reconstruct(
    text1: Text,
    text2: Text,
    text3?: Text,
    text4?: Text,
  ): TestEntity {
    return TestEntity._reconstruct({ text1, text2, text3, text4 });
  }

  public update({ text3, text4 }: { text3?: Text; text4?: Text }): TestEntity {
    return TestEntity._update(this, { text3, text4 });
  }

  public equals(other: TestEntity): boolean {
    return this.get('text1').equals(other.get('text1'));
  }
}

// biome-ignore lint/suspicious/noExportsInTest:
export class TestEntityWithEntity extends Entity<{
  text: Text;
  entity: TestEntity;
}> {
  protected constructor(props: { text: Text; entity: TestEntity }) {
    super(props);
  }

  public static create(text: Text, entity: TestEntity): TestEntityWithEntity {
    return TestEntityWithEntity._create({ text, entity });
  }

  public static reconstruct(
    text: Text,
    entity: TestEntity,
  ): TestEntityWithEntity {
    return TestEntityWithEntity._reconstruct({ text, entity });
  }

  public update({ text, entity }: { text?: Text; entity?: TestEntity }) {
    return TestEntityWithEntity._update(this, { text, entity });
  }

  public equals(other: TestEntityWithEntity): boolean {
    return (
      this.get('text').equals(other.get('text')) &&
      this.get('entity').equals(other.get('entity'))
    );
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

      expect(test.get('text3')?.value).toBe('1');
      expect(test.get('text4')?.value).toBe('abcde');
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

      expect(result.get('text').value).toBe('1');
      expect(result.get('entity').get('text1').value).toBe('1');
      expect(result.get('entity').get('text2').value).toBe('1');
      expect(result.get('entity').get('text3')?.value).toBeUndefined();
      expect(result.get('entity').get('text4')?.value).toBeUndefined();
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

      expect(result.get('text').value).toBe('1');
      expect(result.get('entity').get('text1').value).toBe('1');
      expect(result.get('entity').get('text2').value).toBe('1');
      expect(result.get('entity').get('text3')?.value).toBe('3');
      expect(result.get('entity').get('text4')?.value).toBe('4');
    });

    it('should update entity with entity argument', () => {
      const text = new TestText(1);
      const entity = TestEntity.create(new TestText(1), new TestText('1'));
      const test = TestEntityWithEntity.create(text, entity);

      const newText = new TestText(2);
      const newEntity = TestEntity.create(new TestText(2), new TestText('2'));
      const result = test.update({ text: newText, entity: newEntity });

      expect(result.get('text').value).toBe('2');
      expect(result.get('entity').get('text1').value).toBe('2');
      expect(result.get('entity').get('text2').value).toBe('2');
      expect(result.get('entity').get('text3')?.value).toBeUndefined();
      expect(result.get('entity').get('text4')?.value).toBeUndefined();
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
  });

  it('should return properties including optional ones when provided', () => {
    const text1 = new TestText(1);
    const text2 = new TestText('2');
    const text3 = new TestText(3);
    const text4 = new TestText('4');
    const entity = TestEntity.reconstruct(text1, text2, text3, text4);
    const props = entity.getProps();

    expect(props.text1).toBe(text1);
    expect(props.text2).toBe(text2);
    expect(props.text3).toBe(text3);
    expect(props.text4).toBe(text4);
  });

  it('should return nested entity properties', () => {
    const text = new TestText(1);
    const nestedEntity = TestEntity.create(new TestText(2), new TestText('3'));
    const entity = TestEntityWithEntity.create(text, nestedEntity);
    const props = entity.getProps();

    expect(props.text).toBe(text);
    expect(props.entity).toBe(nestedEntity);
  });
});

describe('getObject', () => {
  it('should convert ValueObject properties to plain objects', () => {
    const entity = TestEntity.create(new TestText(1), new TestText('2'));
    const result = entity.getObject();

    expect(result).toEqual({
      text1: '1',
      text2: '2',
    });
  });

  it('should convert Entity properties to plain objects', () => {
    const text = new TestText(1);
    const entity = TestEntity.create(new TestText(1), new TestText('2'));
    const entityWithEntity = TestEntityWithEntity.create(text, entity);
    const result = entityWithEntity.getObject();

    expect(result).toEqual({
      text: '1',
      entity: {
        text1: '1',
        text2: '2',
      },
    });
  });

  it('should convert Collection properties to plain objects', () => {
    // Create a test collection class
    class TestCollection extends Collection<TestEntity> {}

    // Create a test entity with collection class
    class TestEntityWithCollection extends Entity<{
      text1: Text;
      text2: Text;
      tests: TestCollection;
    }> {
      protected constructor(props: {
        text1: Text;
        text2: Text;
        tests: TestCollection;
      }) {
        super(props);
      }

      public static create(
        text1: Text,
        text2: Text,
        tests: TestCollection,
      ): TestEntityWithCollection {
        return TestEntityWithCollection._create({ text1, text2, tests });
      }

      public equals(other: TestEntityWithCollection): boolean {
        return this.get('text1').equals(other.get('text1'));
      }
    }

    // Create a test collection
    const collection = new TestCollection(
      TestEntity.create(new TestText(1), new TestText('2')),
      TestEntity.create(new TestText(3), new TestText('4')),
    );

    // Create an entity with a collection property
    const entityWithCollection = TestEntityWithCollection.create(
      new TestText(5),
      new TestText('6'),
      collection,
    );

    const result = entityWithCollection.getObject();

    expect(result).toEqual({
      text1: '5',
      text2: '6',
      tests: [
        {
          text1: '1',
          text2: '2',
        },
        {
          text1: '3',
          text2: '4',
        },
      ],
    });
  });

  it('should handle undefined properties', () => {
    const entity = TestEntity.reconstruct(
      new TestText(1),
      new TestText('2'),
      undefined,
      undefined,
    );
    const result = entity.getObject();

    expect(result).toEqual({
      text1: '1',
      text2: '2',
      text3: undefined,
      text4: undefined,
    });
  });
});
