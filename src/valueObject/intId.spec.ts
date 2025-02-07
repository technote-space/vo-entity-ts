import { describe, expect, it } from 'vitest';
import IntId from './intId.js';

class TestIntId extends IntId {
  protected get symbol() {
    return Symbol();
  }
}

describe('IntId', () => {
  it('should create intId', () => {
    expect(new TestIntId(123).value).toBe(123);
    expect(new TestIntId(123.1).value).toBe(123);
    expect(new TestIntId('123').value).toBe(123);
    expect(new TestIntId('123').isSet()).toBe(true);
  });

  it('should compare intId', () => {
    const intId1 = new TestIntId(123);
    const intId2 = new TestIntId(456);
    const intId3 = new TestIntId('456');
    expect(intId1.compare(intId2)).toBe(-1);
    expect(intId2.compare(intId1)).toBe(1);
    expect(intId2.compare(intId3)).toBe(0);
    expect(intId1.equals(intId2)).toBe(false);
    expect(intId2.equals(intId3)).toBe(true);
  });

  it('should get errors', () => {
    expect(new TestIntId('123').getErrors('test')).toBeUndefined();
    expect(new TestIntId(null).getErrors('test')).toBeUndefined();
    expect(new TestIntId('').getErrors('test')).toEqual([
      { name: 'test', error: '整数の形式が正しくありません' },
    ]);
    expect(new TestIntId('10000000000000000').getErrors('test')).toEqual([
      { name: 'test', error: '有効な整数ではありません' },
    ]);
  });

  it('should throw error if id is not set', () => {
    const id = new TestIntId(null);
    expect(id.isSet()).toBe(false);
    expect(() => id.value).toThrow('無効な値です');
  });
});
