import { describe, expect, it } from 'vitest';
import { Flags } from './flags.js';

class TestFlags extends Flags<'test1' | 'test2'> {
  protected get symbol() {
    return Symbol();
  }

  public get flagTypes(): ('test1' | 'test2')[] {
    return ['test1', 'test2'];
  }
}

class TestNullableFlags extends Flags<'test1' | 'test2', true> {
  protected get symbol() {
    return Symbol();
  }

  public get flagTypes(): ('test1' | 'test2')[] {
    return ['test1', 'test2'];
  }
}

describe('Flags', () => {
  it('should create flags', () => {
    expect(new TestFlags('test1').value).toBe('test1');
  });

  it('should compare flags', () => {
    const flag1 = new TestFlags('test1');
    const flag2 = new TestFlags('test2');
    const flag3 = new TestFlags('test2');
    expect(flag1.compare(flag2)).toBe(-1);
    expect(flag2.compare(flag1)).toBe(1);
    expect(flag2.compare(flag3)).toBe(0);
    expect(flag1.equals(flag2)).toBe(false);
    expect(flag2.equals(flag3)).toBe(true);
  });

  it('should get errors', () => {
    expect(new TestFlags('test1').getErrors('test')).toBeUndefined();
    expect(new TestFlags('test3' as never).getErrors('test')).toEqual([
      { name: 'test', error: '定義されていないフラグです: test3' },
    ]);
  });
});

describe('Flags(nullable)', () => {
  it('should create flags', () => {
    expect(new TestNullableFlags('test1').value).toBe('test1');
    expect(new TestNullableFlags(null).value).toBeNull();
  });

  it('should compare flags', () => {
    const flag1 = new TestNullableFlags('test1');
    const flag2 = new TestNullableFlags('test2');
    const flag3 = new TestNullableFlags('test2');
    const flag4 = new TestNullableFlags(null);
    const flag5 = new TestNullableFlags(null);
    expect(flag1.compare(flag2)).toBe(-1);
    expect(flag2.compare(flag1)).toBe(1);
    expect(flag2.compare(flag3)).toBe(0);
    expect(flag3.compare(flag4)).toBe(-1);
    expect(flag4.compare(flag3)).toBe(1);
    expect(flag4.compare(flag5)).toBe(0);
    expect(flag1.equals(flag2)).toBe(false);
    expect(flag2.equals(flag3)).toBe(true);
    expect(flag3.equals(flag4)).toBe(false);
    expect(flag4.equals(flag5)).toBe(true);
  });

  it('should get errors', () => {
    expect(new TestNullableFlags('test1').getErrors('test')).toBeUndefined();
    expect(new TestNullableFlags(null).getErrors('test')).toBeUndefined();
    expect(new TestNullableFlags('test3' as never).getErrors('test')).toEqual([
      { name: 'test', error: '定義されていないフラグです: test3' },
    ]);
  });
});
