import { describe, expect, it } from 'vitest';
import Url from './url.js';

class TestUrl extends Url {
  protected get symbol() {
    return Symbol();
  }
}

describe('Url', () => {
  it('should create url', () => {
    expect(new TestUrl('https://example.com').value).toBe(
      'https://example.com',
    );
    expect(
      new TestUrl('https://example.com/aaa/bbb?ccc=ddd&eee=fff#ggg').value,
    ).toBe('https://example.com/aaa/bbb?ccc=ddd&eee=fff#ggg');
  });

  it('should compare url', () => {
    const url1 = new TestUrl('https://example.com/abc');
    const url2 = new TestUrl('https://example.com/def');
    const url3 = new TestUrl('https://example.com/def');
    expect(url1.compare(url2)).toBe(-1);
    expect(url2.compare(url1)).toBe(1);
    expect(url2.compare(url3)).toBe(0);
    expect(url1.equals(url2)).toBe(false);
    expect(url2.equals(url3)).toBe(true);
  });

  it('should get errors', () => {
    expect(
      new TestUrl('https://example.com').getErrors('test'),
    ).toBeUndefined();
    expect(new TestUrl('abc').getErrors('test')).toEqual([
      { name: 'test', error: 'URLの形式が正しくありません' },
    ]);
  });
});
