import { describe, expect, it } from 'vitest';
import { StringId } from './stringId.js';

class TestStringId extends StringId {
  protected get symbol() {
    return Symbol();
  }
}

class TestNullableStringId extends StringId<true> {
  protected get symbol() {
    return Symbol();
  }
}

describe('StringId', () => {
  it('should create stringId', () => {
    expect(new TestStringId('test').value).toBe('test');
    expect(new TestStringId('123').value).toBe('123');
    expect(new TestStringId(undefined).value).toEqual(expect.any(String));
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
    expect(new TestStringId(undefined).getErrors('test')).toBeUndefined();
    expect(new TestStringId('').getErrors('test')).toEqual([
      { name: 'test', error: '値を指定してください' },
    ]);
  });
});

describe('StringId(nullable)', () => {
  it('should create stringId', () => {
    expect(new TestNullableStringId('test').value).toBe('test');
    expect(new TestNullableStringId('123').value).toBe('123');
    expect(new TestStringId(undefined).value).toEqual(expect.any(String));
    expect(new TestNullableStringId(null).value).toBeNull();
  });

  it('should compare stringId', () => {
    const stringId1 = new TestNullableStringId('abc');
    const stringId2 = new TestNullableStringId('def');
    const stringId3 = new TestNullableStringId('def');
    const stringId4 = new TestNullableStringId(null);
    const stringId5 = new TestNullableStringId(null);
    expect(stringId1.compare(stringId2)).toBe(-1);
    expect(stringId2.compare(stringId1)).toBe(1);
    expect(stringId2.compare(stringId3)).toBe(0);
    expect(stringId3.compare(stringId4)).toBe(-1);
    expect(stringId4.compare(stringId3)).toBe(1);
    expect(stringId4.compare(stringId5)).toBe(0);
    expect(stringId1.equals(stringId2)).toBe(false);
    expect(stringId2.equals(stringId3)).toBe(true);
    expect(stringId3.equals(stringId4)).toBe(false);
    expect(stringId4.equals(stringId5)).toBe(true);
  });

  it('should get errors', () => {
    expect(new TestNullableStringId('123').getErrors('test')).toBeUndefined();
    expect(
      new TestNullableStringId(undefined).getErrors('test'),
    ).toBeUndefined();
    expect(new TestNullableStringId(null).getErrors('test')).toBeUndefined();
    expect(new TestNullableStringId('').getErrors('test')).toEqual([
      { name: 'test', error: '値を指定してください' },
    ]);
  });
});
