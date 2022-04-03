import Float from './float';

class TestFloat extends Float {
  protected get symbol() {
    return Symbol();
  }
}

class TestFloatWithLimit extends TestFloat {
  protected get symbol() {
    return Symbol();
  }

  protected getMaxNumber(): number | undefined {
    return 10;
  }

  protected getMinNumber(): number | undefined {
    return -10;
  }
}

class TestFloatWithTruncateMode extends TestFloatWithLimit {
  protected get symbol() {
    return Symbol();
  }

  protected isTruncateMode(): boolean {
    return true;
  }
}

describe('Float', () => {
  it('should create float', () => {
    expect(TestFloat.create('123.45').value).toBe(123.45);
    expect(TestFloat.create('123').value).toBe(123);
  });

  it('should compare float', () => {
    const float1 = TestFloat.create('123.45');
    const float2 = TestFloat.create('678');
    const float3 = TestFloat.create(678);
    expect(float1.compare(float2)).toBe(-1);
    expect(float2.compare(float1)).toBe(1);
    expect(float2.compare(float3)).toBe(0);
    expect(float1.equals(float2)).toBe(false);
    expect(float2.equals(float3)).toBe(true);
  });

  it('should get errors', () => {
    expect(TestFloat.create('123').getErrors('test')).toBeUndefined();
    expect(TestFloat.create('abc').getErrors('test')).toEqual([{ name: 'test', error: '数値の形式が正しくありません' }]);
  });
});

describe('Float with limit', () => {
  it('should get errors', () => {
    expect(TestFloatWithLimit.create('11').getErrors('test')).toEqual([{ name: 'test', error: '10以下の値を入力してください' }]);
    expect(TestFloatWithLimit.create('-11').getErrors('test')).toEqual([{ name: 'test', error: '-10以上の値を入力してください' }]);
  });
});

describe('Float(truncate mode)', () => {
  it('should get truncated value', () => {
    expect(TestFloatWithTruncateMode.create('11').value).toBe(10);
    expect(TestFloatWithTruncateMode.create('-11').value).toBe(-10);
  });

  it('should get errors', () => {
    expect(TestFloatWithTruncateMode.create('11').getErrors('test')).toBeUndefined();
    expect(TestFloatWithTruncateMode.create('-11').getErrors('test')).toBeUndefined();
  });
});
