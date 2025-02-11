import { describe, expect, it } from 'vitest';
import type { ValidationError } from '../valueObject/index.js';
import { ValueObject } from '../valueObject/index.js';
import type { Text } from '../valueObject/text.js';
import { Collection } from './collection.js';
import { Entity } from './index.js';
import { TestEntity, TestText } from './index.spec.js';

class TestCollection extends Collection<TestEntity> {}

class TestEntityWithCollection extends TestEntity {
  protected tests!: TestCollection;

  public static createWithCollection(
    text1: Text,
    text2: Text,
    tests: TestCollection,
  ): TestEntity {
    const instance = TestEntity.reconstruct(
      text1,
      text2,
    ) as TestEntityWithCollection;
    instance.tests = tests;

    return instance;
  }
}

class TestValueObjectWithError extends ValueObject<number, number> {
  protected get symbol() {
    return Symbol();
  }

  public compare(): number {
    return 0;
  }

  public getErrors(name: string): ValidationError[] | undefined {
    return [
      { name, error: 'test error1' },
      { name, error: 'test error2' },
    ];
  }
}

class TestEntityWithError extends Entity {
  public constructor(public readonly test: TestValueObjectWithError) {
    super();
  }

  public static reconstruct(
    test: TestValueObjectWithError,
  ): TestEntityWithError {
    return TestEntityWithError._reconstruct(test);
  }

  public equals(): boolean {
    return false;
  }
}

class TestCollectionWithError extends Collection<TestEntityWithError> {}

describe('Entity Collection', () => {
  it('should throw error if call constructor directory', () => {
    expect(() => new TestCollection([])).toThrow();
  });

  describe('find', () => {
    const collection = TestCollection.create([
      TestEntity.create(new TestText(1), new TestText('2')),
      TestEntity.create(new TestText(3), new TestText('4')),
    ]);

    it('should return found item', () => {
      const item = collection.find((item) => item.text1.value === '1');
      expect(item).not.toBeUndefined();
      expect(item?.text1.value).toBe('1');
      expect(item?.text2.value).toBe('2');
    });

    it('should return undefined if not found', () => {
      expect(
        collection.find((item) => item.text1.value === '0'),
      ).toBeUndefined();
    });
  });

  describe('filter', () => {
    it('should return filtered collection', () => {
      const collection = TestCollection.create([
        TestEntity.create(new TestText(1), new TestText('2')),
        TestEntity.create(new TestText(3), new TestText('4')),
        TestEntity.create(new TestText(5), new TestText('6')),
      ]).filter((item) => item.text1.value === '1' || item.text2.value === '6');

      expect(collection).toHaveLength(2);
      expect(collection[0]?.text1.value).toBe('1');
      expect(collection[0]?.text2.value).toBe('2');
      expect(collection[1]?.text1.value).toBe('5');
      expect(collection[1]?.text2.value).toBe('6');
    });
  });

  describe('isEmpty', () => {
    it('should return true if empty', () => {
      expect(TestCollection.create([]).isEmpty()).toBe(true);
    });
    it('should return false if not empty', () => {
      expect(
        TestCollection.create([
          TestEntity.create(new TestText(1), new TestText('1')),
        ]).isEmpty(),
      ).toBe(false);
    });
  });

  describe('getErrors', () => {
    it('should not throw error', () => {
      expect(
        TestCollection.create([
          TestEntity.reconstruct(new TestText(1), new TestText('1')),
          TestEntity.reconstruct(new TestText(2), new TestText('2')),
        ]).getErrors(),
      ).toBeUndefined();
    });

    it('should return validation errors', () => {
      const errors = TestCollection.create([
        TestEntity.reconstruct(new TestText(1), new TestText('1')),
        TestEntity.reconstruct(new TestText(2), new TestText('')),
        TestEntity.reconstruct(new TestText(''), new TestText('')),
      ]).getErrors();

      expect(errors).not.toBeUndefined();
      expect(errors).toEqual({
        'text1[2]': ['値を指定してください'],
        'text2[1]': ['値を指定してください'],
        'text2[2]': ['値を指定してください'],
      });
    });
  });

  describe('iterator', () => {
    it('should be iterable', () => {
      const items: string[][] = [];
      for (const item of TestCollection.create([
        TestEntity.reconstruct(new TestText(1), new TestText('2')),
        TestEntity.reconstruct(new TestText(3), new TestText('4')),
      ])) {
        items.push([item.text1.value, item.text2.value]);
      }

      expect(items).toEqual([
        ['1', '2'],
        ['3', '4'],
      ]);
    });
  });

  describe('validate', () => {
    it('should throw error', () => {
      expect(() =>
        TestCollection.create([
          TestEntity.reconstruct(new TestText(1), new TestText('1')),
          TestEntity.reconstruct(new TestText(2), new TestText('2')),
        ]).validate(),
      ).not.toThrow();
    });
  });
});

describe('Entity with collection', () => {
  describe('getErrors', () => {
    it('should return empty', () => {
      expect(
        TestEntityWithCollection.createWithCollection(
          new TestText(1),
          new TestText('1'),
          TestCollection.create([]),
        ).getErrors(),
      ).toEqual({});
    });

    it('should return validation errors', () => {
      const errors = TestEntityWithCollection.createWithCollection(
        new TestText(''),
        new TestText(''),
        TestCollection.create([
          TestEntity.reconstruct(new TestText(1), new TestText('1')),
          TestEntity.reconstruct(new TestText(2), new TestText('')),
          TestEntity.reconstruct(new TestText(''), new TestText('')),
        ]),
      ).getErrors();

      expect(errors).not.toBeUndefined();
      expect(errors).toEqual({
        text1: ['値を指定してください'],
        'text1[2]': ['値を指定してください'],
        text2: ['値を指定してください'],
        'text2[1]': ['値を指定してください'],
        'text2[2]': ['値を指定してください'],
      });
    });
  });
});

describe('Entity Collection with error', () => {
  describe('validate', () => {
    it('should throw error', () => {
      expect(() =>
        TestCollectionWithError.create([
          TestEntityWithError.reconstruct(new TestValueObjectWithError(1)),
          TestEntityWithError.reconstruct(new TestValueObjectWithError(3)),
        ]).validate(),
      ).toThrow();
    });
  });
});
