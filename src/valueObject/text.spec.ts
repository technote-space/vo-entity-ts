import Text from './text';

class TestText extends Text {
  protected get symbol() {
    return Symbol();
  }
}

class TestTextWithLimit extends TestText {
  protected get symbol() {
    return Symbol();
  }

  protected getValidationMinLength(): number | undefined {
    return 5;
  }

  protected getValidationMaxLength(): number | undefined {
    return 10;
  }
}

describe('Text', () => {
  it('should create text', () => {
    expect(TestText.create('').value).toBe('');
    expect(TestText.create('test').value).toBe('test');
    expect(TestText.create(123).value).toBe('123');
  });

  it('should compare text', () => {
    const text1 = TestText.create('abc');
    const text2 = TestText.create('def');
    const text3 = TestText.create('def');
    expect(text1.compare(text2)).toBe(-1);
    expect(text2.compare(text1)).toBe(1);
    expect(text2.compare(text3)).toBe(0);
    expect(text1.equals(text2)).toBe(false);
    expect(text2.equals(text3)).toBe(true);
  });

  it('should get errors', () => {
    expect(TestText.create('123').getErrors('test')).toEqual([]);
    expect(TestText.create('').getErrors('test')).toEqual([{ name: 'test', error: '値を指定してください' }]);
  });
});

describe('Text with limit', () => {
  it('should get errors', () => {
    expect(TestTextWithLimit.create('1234').getErrors('test')).toEqual([{ name: 'test', error: '5文字より長く入力してください' }]);
    expect(TestTextWithLimit.create('12345678901').getErrors('test')).toEqual([{ name: 'test', error: '10文字より短く入力してください' }]);
  });
});
