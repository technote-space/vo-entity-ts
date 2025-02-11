import { describe, expect, it } from 'vitest';
import { Text } from './text.js';

class TestText extends Text {
  protected get symbol() {
    return Symbol();
  }
}

class TestNullableText extends Text<true> {
  protected get symbol() {
    return Symbol();
  }
}

class TestTextWithLimit extends TestText {
  protected override get symbol() {
    return Symbol();
  }

  protected override getValidationMinLength(): number | undefined {
    return 5;
  }

  protected override getValidationMaxLength(): number | undefined {
    return 10;
  }
}

describe('Text', () => {
  it('should create text', () => {
    expect(new TestText('').value).toBe('');
    expect(new TestText('test').value).toBe('test');
    expect(new TestText(123).value).toBe('123');
  });

  it('should compare text', () => {
    const text1 = new TestText('abc');
    const text2 = new TestText('def');
    const text3 = new TestText('def');
    expect(text1.compare(text2)).toBe(-1);
    expect(text2.compare(text1)).toBe(1);
    expect(text2.compare(text3)).toBe(0);
    expect(text1.equals(text2)).toBe(false);
    expect(text2.equals(text3)).toBe(true);
  });

  it('should get errors', () => {
    expect(new TestText('123').getErrors('test')).toBeUndefined();
    expect(new TestText('').getErrors('test')).toEqual([
      { name: 'test', error: '値を指定してください' },
    ]);
  });
});

describe('Text(nullable)', () => {
  it('should create text', () => {
    expect(new TestNullableText('').value).toBe('');
    expect(new TestNullableText('test').value).toBe('test');
    expect(new TestNullableText(123).value).toBe('123');
    expect(new TestNullableText(null).value).toBeNull();
  });

  it('should compare text', () => {
    const text1 = new TestNullableText('abc');
    const text2 = new TestNullableText('def');
    const text3 = new TestNullableText('def');
    const text4 = new TestNullableText(null);
    const text5 = new TestNullableText(null);
    expect(text1.compare(text2)).toBe(-1);
    expect(text2.compare(text1)).toBe(1);
    expect(text2.compare(text3)).toBe(0);
    expect(text3.compare(text4)).toBe(-1);
    expect(text4.compare(text3)).toBe(1);
    expect(text4.compare(text5)).toBe(0);
    expect(text1.equals(text2)).toBe(false);
    expect(text2.equals(text3)).toBe(true);
    expect(text3.equals(text4)).toBe(false);
    expect(text4.equals(text5)).toBe(true);
  });

  it('should get errors', () => {
    expect(new TestNullableText('123').getErrors('test')).toBeUndefined();
    expect(new TestNullableText(null).getErrors('test')).toBeUndefined();
    expect(new TestNullableText('').getErrors('test')).toEqual([
      { name: 'test', error: '値を指定してください' },
    ]);
  });
});

describe('Text with limit', () => {
  it('should get errors', () => {
    expect(new TestTextWithLimit('1234').getErrors('test')).toEqual([
      { name: 'test', error: '5文字より長く入力してください' },
    ]);
    expect(new TestTextWithLimit('12345678901').getErrors('test')).toEqual([
      { name: 'test', error: '10文字より短く入力してください' },
    ]);
  });
});
