import { describe, expect, it } from 'vitest';
import Flags from './flags.js';
class TestFlags extends Flags<'test1' | 'test2'> {
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
  });

  it('should throw error if not included flag', () => {
    expect(new TestFlags('test3').getErrors('test')).toEqual([
      { name: 'test', error: '定義されていないフラグです: test3' },
    ]);
  });
});
