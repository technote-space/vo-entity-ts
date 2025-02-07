import { describe, expect, it } from 'vitest';
import DateObject from './date.js';

class TestDate extends DateObject {
  protected get symbol() {
    return Symbol();
  }
}

describe('Date', () => {
  it('should create date', () => {
    const date = new TestDate('2020-10-20');
    expect(date.value.year()).toBe(2020);
    expect(date.value.month()).toBe(9);
    expect(date.value.date()).toBe(20);
  });

  it('should compare date', () => {
    const date1 = new TestDate('2020-10-20');
    const date2 = new TestDate('2021-10-20');
    const date3 = new TestDate('2021-10-20');
    expect(date1.compare(date2)).toBe(-1);
    expect(date2.compare(date1)).toBe(1);
    expect(date2.compare(date3)).toBe(0);
    expect(date1.equals(date2)).toBe(false);
    expect(date2.equals(date3)).toBe(true);
  });

  it('should get errors', () => {
    expect(new TestDate('2020-10-20').getErrors('test')).toBeUndefined();
    expect(
      new TestDate('2020-10-20T10:00:00+09:00').getErrors('test'),
    ).toBeUndefined();
    expect(new TestDate(undefined).getErrors('test')).toBeUndefined();
    expect(new TestDate('abc').getErrors('test')).toEqual([
      { name: 'test', error: '日付の形式が正しくありません' },
    ]);
  });
});
