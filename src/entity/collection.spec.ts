import Text from '../valueObject/text';
import { TestText, TestEntity } from './index.spec';
import Collection from './collection';

class TestCollection extends Collection<TestEntity> {
}

class TestBaseWithCollection extends TestEntity {
  private tests!: TestCollection;

  public static createWithCollection(text1: Text, text2: Text, tests: TestCollection): TestEntity {
    const instance = TestEntity.reconstruct(text1, text2) as TestBaseWithCollection;
    instance.tests = tests;

    return instance;
  }
}

describe('Entity CollectionBase', () => {
  it('should throw error if call constructor directory', () => {
    expect(() => new TestCollection([])).toThrow();
  });

  describe('isEmpty', () => {
    it('should return true if empty', () => {
      expect(TestCollection.create([]).isEmpty()).toBe(true);
    });
    it('should return false if not empty', () => {
      expect(TestCollection.create([TestEntity.create(TestText.create(1), TestText.create('1'))]).isEmpty()).toBe(false);
    });
  });

  describe('validate', () => {
    it('should not throw error', () => {
      expect(TestCollection.create([
        TestEntity.reconstruct(TestText.create(1), TestText.create('1')),
        TestEntity.reconstruct(TestText.create(2), TestText.create('2')),
      ]).validate()).toBeUndefined();
    });

    it('should return validation errors', () => {
      const errors = TestCollection.create([
        TestEntity.reconstruct(TestText.create(1), TestText.create('1')),
        TestEntity.reconstruct(TestText.create(2), TestText.create('')),
        TestEntity.reconstruct(TestText.create(''), TestText.create('')),
      ]).validate();

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
        TestEntity.reconstruct(TestText.create(1), TestText.create('2')),
        TestEntity.reconstruct(TestText.create(3), TestText.create('4')),
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
      expect(TestBaseWithCollection.createWithCollection(
        TestText.create(1),
        TestText.create('1'),
        TestCollection.create([]),
      ).getErrors()).toEqual({});
    });

    it('should return validation errors', () => {
      const errors = TestBaseWithCollection.createWithCollection(
        TestText.create(''),
        TestText.create(''),
        TestCollection.create([
          TestEntity.reconstruct(TestText.create(1), TestText.create('1')),
          TestEntity.reconstruct(TestText.create(2), TestText.create('')),
          TestEntity.reconstruct(TestText.create(''), TestText.create('')),
        ])).getErrors();

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
