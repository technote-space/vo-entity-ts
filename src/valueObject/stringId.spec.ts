import { describe, expect, it } from 'vitest';
import StringId from './stringId.js';

class TestStringId extends StringId {
  protected get symbol() {
    return Symbol();
  }
}

describe('StringId', () => {
  it('should create stringId', () => {
    expect(new TestStringId('test').value).toBe('test');
    expect(new TestStringId('123').value).toBe('123');
    expect(new TestStringId('123').isSet()).toBe(true);
  });

  it('should compare stringId', () => {
    const stringId1 = new TestStringId('abc');
    const stringId2 = new TestStringId('def');
    const stringId3 = new TestStringId('def');
    expect(stringId1.compare(stringId2)).toBe(-1);
    expect(stringId2.compare(stringId1)).toBe(1);
    expect(stringId2.compare(stringId3)).toBe(0);
    expect(stringId1.equals(stringId2)).toBe(false);
    expect(stringId2.equals(stringId3)).toBe(true);
  });

  it('should get errors', () => {
    expect(new TestStringId('123').getErrors('test')).toBeUndefined();
    expect(new TestStringId(null).getErrors('test')).toBeUndefined();
    expect(new TestStringId('').getErrors('test')).toEqual([
      { name: 'test', error: '値を指定してください' },
    ]);
  });

  it('should throw error if id is not set', () => {
    const id = new TestStringId(null);
    expect(id.isSet()).toBe(false);
    expect(() => id.value).toThrow('無効な値です');
  });
});
