import { describe, expect, it } from 'vitest';
import { Text } from '../valueObject/text.js';
import { Collection } from './collection.js';

class TestText extends Text {
  protected get symbol(): symbol {
    return Symbol();
  }
}

class TestCollection extends Collection<TestText> {}

describe('Value Collection', () => {
  describe('find', () => {
    const collection = new TestCollection(new TestText(1), new TestText('2'));

    it('should return found item', () => {
      const item = collection.find((item) => item.value === '1');
      expect(item).not.toBeUndefined();
      expect(item?.value).toBe('1');
    });

    it('should return undefined if not found', () => {
      expect(collection.find((item) => item.value === '0')).toBeUndefined();
    });
  });

  describe('filter', () => {
    it('should return filtered collection', () => {
      const collection = new TestCollection(
        new TestText(1),
        new TestText('2'),
        new TestText(3),
      ).filter(
        (item) =>
          item.value === '1' || item.value === '2' || item.value === '10',
      );

      expect(collection).toHaveLength(2);
      expect(collection[0]?.value).toBe('1');
      expect(collection[1]?.value).toBe('2');
    });
  });

  describe('map', () => {
    it('should return mapped collection', () => {
      const collection = new TestCollection(
        new TestText(1),
        new TestText('2'),
        new TestText(3),
      ).map((item) => item.value.repeat(2));

      expect(collection).toHaveLength(3);
      expect(collection[0]).toBe('11');
      expect(collection[1]).toBe('22');
      expect(collection[2]).toBe('33');
    });
  });

  describe('length', () => {
    it('should return length', () => {
      expect(new TestCollection().length).toBe(0);
      expect(
        new TestCollection(new TestText(1), new TestText('2'), new TestText(3))
          .length,
      ).toBe(3);
    });
  });

  describe('iterator', () => {
    it('should be iterable', () => {
      const items: string[] = [];
      for (const item of new TestCollection(
        new TestText(1),
        new TestText('2'),
        new TestText(3),
      )) {
        items.push(item.value);
      }

      expect(items).toEqual(['1', '2', '3']);
    });
  });

  describe('sorted', () => {
    it('should return sorted collection', () => {
      const collection = new TestCollection(
        new TestText('2'),
        new TestText(1),
        new TestText(3),
      ).sorted((a, b) => a.compare(b));

      expect(collection).toHaveLength(3);
      expect(collection[0]?.value).toBe('1');
      expect(collection[1]?.value).toBe('2');
      expect(collection[2]?.value).toBe('3');
    });
  });

  describe('isEmpty', () => {
    it('should return true if empty', () => {
      expect(new TestCollection().isEmpty()).toBe(true);
    });

    it('should return false if not empty', () => {
      expect(
        new TestCollection(
          new TestText(1),
          new TestText('2'),
          new TestText(3),
        ).isEmpty(),
      ).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true if same', () => {
      expect(new TestCollection().equals(new TestCollection())).toBe(true);
      expect(
        new TestCollection(
          new TestText(1),
          new TestText('2'),
          new TestText(3),
        ).equals(
          new TestCollection(new TestText(1), new TestText(2), new TestText(3)),
        ),
      ).toBe(true);
    });

    it('should return false if not same', () => {
      expect(
        new TestCollection(
          new TestText(1),
          new TestText(2),
          new TestText(3),
        ).equals(new TestCollection(new TestText(1), new TestText(2))),
      ).toBe(false);
      expect(
        new TestCollection(
          new TestText(1),
          new TestText(2),
          new TestText(3),
        ).equals(
          new TestCollection(new TestText(2), new TestText(2), new TestText(3)),
        ),
      ).toBe(false);
    });
  });
});
