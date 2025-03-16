import { describe, expect, it } from 'vitest';
import type { Text } from '../valueObject/text.js';
import { Collection } from './collection.js';
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

describe('Entity Collection', () => {
  describe('find', () => {
    const collection = new TestCollection([
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
      const collection = new TestCollection([
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

  describe('map', () => {
    it('should return mapped collection', () => {
      const collection = new TestCollection([
        TestEntity.create(new TestText(1), new TestText('2')),
        TestEntity.create(new TestText(3), new TestText('4')),
        TestEntity.create(new TestText(5), new TestText('6')),
      ]).map((item) => item.text1.value);

      expect(collection).toHaveLength(3);
      expect(collection[0]).toBe('1');
      expect(collection[1]).toBe('3');
      expect(collection[2]).toBe('5');
    });
  });

  describe('sorted', () => {
    it('should return sorted collection', () => {
      const collection = new TestCollection([
        TestEntity.create(new TestText(3), new TestText('4')),
        TestEntity.create(new TestText(1), new TestText('2')),
        TestEntity.create(new TestText(5), new TestText('6')),
      ]).sorted((a, b) => a.text1.compare(b.text1));

      expect(collection).toHaveLength(3);
      expect(collection[0]?.text1.value).toBe('1');
      expect(collection[1]?.text1.value).toBe('3');
      expect(collection[2]?.text1.value).toBe('5');
    });
  });

  describe('isEmpty', () => {
    it('should return true if empty', () => {
      expect(new TestCollection([]).isEmpty()).toBe(true);
    });
    it('should return false if not empty', () => {
      expect(
        new TestCollection([
          TestEntity.create(new TestText(1), new TestText('1')),
        ]).isEmpty(),
      ).toBe(false);
    });
  });

  describe('count', () => {
    it('should return count', () => {
      expect(new TestCollection([]).count()).toBe(0);
      expect(
        new TestCollection([
          TestEntity.create(new TestText(1), new TestText('1')),
          TestEntity.create(new TestText(2), new TestText('2')),
        ]).count(),
      ).toBe(2);
    });
  });

  describe('getErrors', () => {
    it('should not throw error', () => {
      expect(
        new TestCollection([
          TestEntity.reconstruct(new TestText(1), new TestText('1')),
          TestEntity.reconstruct(new TestText(2), new TestText('2')),
        ]).getErrors(),
      ).toBeUndefined();
    });

    it('should return validation errors', () => {
      const errors = new TestCollection([
        TestEntity.reconstruct(new TestText(1), new TestText('1')),
        TestEntity.reconstruct(new TestText(2), new TestText('')),
        TestEntity.reconstruct(new TestText(''), new TestText('')),
      ]).getErrors(
        new TestCollection([
          TestEntity.reconstruct(new TestText(1), new TestText('1')),
        ]),
      );

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
      for (const item of new TestCollection([
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
});

describe('Entity with collection', () => {
  describe('getErrors', () => {
    it('should return empty', () => {
      expect(
        TestEntityWithCollection.createWithCollection(
          new TestText(1),
          new TestText('1'),
          new TestCollection([]),
        ).getErrors(),
      ).toEqual({});
    });

    it('should return validation errors', () => {
      const errors = TestEntityWithCollection.createWithCollection(
        new TestText(''),
        new TestText(''),
        new TestCollection([
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
