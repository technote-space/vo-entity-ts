import type { ValidationError } from '../valueObject';
import ValueObject  from '../valueObject';
import Text from '../valueObject/text';
import Collection from './collection';
import { TestText, TestEntity } from './index.spec';
import Entity from '.';

class TestCollection extends Collection<TestEntity> {
}

class TestEntityWithCollection extends TestEntity {
  private tests!: TestCollection;

  public static createWithCollection(text1: Text, text2: Text, tests: TestCollection): TestEntity {
    const instance = TestEntity.reconstruct(text1, text2) as TestEntityWithCollection;
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
    return [{ name, error: 'test error1' }, { name, error: 'test error2' }];
  }
}

class TestEntityWithError extends Entity {
  public constructor(public readonly test: TestValueObjectWithError) {
    super();
  }

  public static reconstruct(test: TestValueObjectWithError): TestEntityWithError {
    return TestEntityWithError._reconstruct(test);
  }

  public equals(): boolean {
    return false;
  }
}

class TestCollectionWithError extends Collection<TestEntityWithError> {
}

describe('Entity Collection', () => {
  it('should throw error if call constructor directory', () => {
    expect(() => new TestCollection([])).toThrow();
  });

  describe('find', () => {
    const collection = TestCollection.create([
      TestEntity.create(TestText.create(1), TestText.create('2')),
      TestEntity.create(TestText.create(3), TestText.create('4')),
    ]);

    it('should return found item', () => {
      const item = collection.find(item => item.text1.value === '1');
      expect(item).not.toBeUndefined();
      expect(item?.text1.value).toBe('1');
      expect(item?.text2.value).toBe('2');
    });

    it('should return undefined if not found', () => {
      expect(collection.find(item => item.text1.value === '0')).toBeUndefined();
    });
  });

  describe('filter', () => {
    it('should return filtered collection', () => {
      const collection = TestCollection.create([
        TestEntity.create(TestText.create(1), TestText.create('2')),
        TestEntity.create(TestText.create(3), TestText.create('4')),
        TestEntity.create(TestText.create(5), TestText.create('6')),
      ]).filter(item => item.text1.value === '1' || item.text2.value === '6');

      expect(collection).toHaveLength(2);
      expect(collection[0].text1.value).toBe('1');
      expect(collection[0].text2.value).toBe('2');
      expect(collection[1].text1.value).toBe('5');
      expect(collection[1].text2.value).toBe('6');
    });
  });

  describe('isEmpty', () => {
    it('should return true if empty', () => {
      expect(TestCollection.create([]).isEmpty()).toBe(true);
    });
    it('should return false if not empty', () => {
      expect(TestCollection.create([TestEntity.create(TestText.create(1), TestText.create('1'))]).isEmpty()).toBe(false);
    });
  });

  describe('getErrors', () => {
    it('should not throw error', () => {
      expect(TestCollection.create([
        TestEntity.reconstruct(TestText.create(1), TestText.create('1')),
        TestEntity.reconstruct(TestText.create(2), TestText.create('2')),
      ]).getErrors()).toBeUndefined();
    });

    it('should return validation errors', () => {
      const errors = TestCollection.create([
        TestEntity.reconstruct(TestText.create(1), TestText.create('1')),
        TestEntity.reconstruct(TestText.create(2), TestText.create('')),
        TestEntity.reconstruct(TestText.create(''), TestText.create('')),
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

  describe('validate', () => {
    it('should throw error', () => {
      expect(() => TestCollection.create([
        TestEntity.reconstruct(TestText.create(1), TestText.create('1')),
        TestEntity.reconstruct(TestText.create(2), TestText.create('2')),
      ]).validate()).not.toThrow();
    });
  });
});

describe('Entity with collection', () => {
  describe('getErrors', () => {
    it('should return empty', () => {
      expect(TestEntityWithCollection.createWithCollection(
        TestText.create(1),
        TestText.create('1'),
        TestCollection.create([]),
      ).getErrors()).toEqual({});
    });

    it('should return validation errors', () => {
      const errors = TestEntityWithCollection.createWithCollection(
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

describe('Entity Collection with error', () => {
  describe('validate', () => {
    it('should throw error', () => {
      expect(() => TestCollectionWithError.create([
        TestEntityWithError.reconstruct(TestValueObjectWithError.create(1)),
        TestEntityWithError.reconstruct(TestValueObjectWithError.create(3)),
      ]).validate()).toThrow();
    });
  });
});
