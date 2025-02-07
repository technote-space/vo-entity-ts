import { describe, expect, it } from 'vitest';
import Text from './text.js';

class TestText extends Text {
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
    expect(new TestText('123').getErrors('test')).toEqual([]);
    expect(new TestText('').getErrors('test')).toEqual([
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
