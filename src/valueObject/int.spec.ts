import { describe, expect, it } from 'vitest';
import { Int } from './int.js';

class TestInt extends Int {
  protected get symbol() {
    return Symbol();
  }
}

class TestNullableInt extends Int<true> {
  protected get symbol() {
    return Symbol();
  }
}

describe('Int', () => {
  it('should get errors', () => {
    expect(new TestInt('123').getErrors('test')).toBeUndefined();
    expect(new TestInt('abc').getErrors('test')).toEqual([
      { name: 'test', error: '数値の形式が正しくありません' },
    ]);
    expect(new TestInt('123.45').getErrors('test')).toEqual([
      { name: 'test', error: '整数の形式が正しくありません' },
    ]);
    expect(new TestInt('10000000000000000').getErrors('test')).toEqual([
      { name: 'test', error: '有効な整数ではありません' },
    ]);
  });
});

describe('Int(nullable)', () => {
  it('should create int', () => {
    expect(new TestNullableInt('123').value).toBe(123);
    expect(new TestNullableInt('123.45').value).toBe(123);
    expect(new TestNullableInt(null).value).toBeNull();
  });

  it('should get errors', () => {
    expect(new TestNullableInt('123').getErrors('test')).toBeUndefined();
    expect(new TestNullableInt(null).getErrors('test')).toBeUndefined();
    expect(new TestNullableInt('abc').getErrors('test')).toEqual([
      { name: 'test', error: '数値の形式が正しくありません' },
    ]);
    expect(new TestNullableInt('123.45').getErrors('test')).toEqual([
      { name: 'test', error: '整数の形式が正しくありません' },
    ]);
    expect(new TestNullableInt('10000000000000000').getErrors('test')).toEqual([
      { name: 'test', error: '有効な整数ではありません' },
    ]);
  });
});
