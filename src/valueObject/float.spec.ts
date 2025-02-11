import { describe, expect, it } from 'vitest';
import { Float } from './float.js';

class TestFloat extends Float {
  protected get symbol() {
    return Symbol();
  }
}

class TestNullableFloat extends Float<true> {
  protected get symbol() {
    return Symbol();
  }
}

class TestFloatWithLimit extends TestFloat {
  protected override get symbol() {
    return Symbol();
  }

  protected override getMaxNumber(): number | undefined {
    return 10;
  }

  protected override getMinNumber(): number | undefined {
    return -10;
  }
}

class TestFloatWithTruncateMode extends TestFloatWithLimit {
  protected override get symbol() {
    return Symbol();
  }

  protected override isTruncateMode(): boolean {
    return true;
  }
}

describe('Float', () => {
  it('should create float', () => {
    expect(new TestFloat('123.45').value).toBe(123.45);
    expect(new TestFloat('123').value).toBe(123);
  });

  it('should compare float', () => {
    const float1 = new TestFloat('123.45');
    const float2 = new TestFloat('678');
    const float3 = new TestFloat(678);
    expect(float1.compare(float2)).toBe(-1);
    expect(float2.compare(float1)).toBe(1);
    expect(float2.compare(float3)).toBe(0);
    expect(float1.equals(float2)).toBe(false);
    expect(float2.equals(float3)).toBe(true);
  });

  it('should get errors', () => {
    expect(new TestFloat('123').getErrors('test')).toBeUndefined();
    expect(new TestFloat('abc').getErrors('test')).toEqual([
      { name: 'test', error: '数値の形式が正しくありません' },
    ]);
  });
});

describe('Float(nullable)', () => {
  it('should create float', () => {
    expect(new TestNullableFloat('123.45').value).toBe(123.45);
    expect(new TestNullableFloat('123').value).toBe(123);
    expect(new TestNullableFloat(null).value).toBeNull();
  });

  it('should compare float', () => {
    const float1 = new TestNullableFloat('123.45');
    const float2 = new TestNullableFloat('678');
    const float3 = new TestNullableFloat(678);
    const float4 = new TestNullableFloat(null);
    const float5 = new TestNullableFloat(null);
    expect(float1.compare(float2)).toBe(-1);
    expect(float2.compare(float1)).toBe(1);
    expect(float2.compare(float3)).toBe(0);
    expect(float3.compare(float4)).toBe(-1);
    expect(float4.compare(float3)).toBe(1);
    expect(float4.compare(float5)).toBe(0);
    expect(float1.equals(float2)).toBe(false);
    expect(float2.equals(float3)).toBe(true);
    expect(float3.equals(float4)).toBe(false);
    expect(float4.equals(float5)).toBe(true);
  });

  it('should get errors', () => {
    expect(new TestNullableFloat('123').getErrors('test')).toBeUndefined();
    expect(new TestNullableFloat(null).getErrors('test')).toBeUndefined();
    expect(new TestNullableFloat('abc').getErrors('test')).toEqual([
      { name: 'test', error: '数値の形式が正しくありません' },
    ]);
  });
});

describe('Float with limit', () => {
  it('should get errors', () => {
    expect(new TestFloatWithLimit('11').getErrors('test')).toEqual([
      { name: 'test', error: '10以下の値を入力してください' },
    ]);
    expect(new TestFloatWithLimit('-11').getErrors('test')).toEqual([
      { name: 'test', error: '-10以上の値を入力してください' },
    ]);
  });
});

describe('Float(truncate mode)', () => {
  it('should get truncated value', () => {
    expect(new TestFloatWithTruncateMode('11').value).toBe(10);
    expect(new TestFloatWithTruncateMode('-11').value).toBe(-10);
  });

  it('should get errors', () => {
    expect(
      new TestFloatWithTruncateMode('11').getErrors('test'),
    ).toBeUndefined();
    expect(
      new TestFloatWithTruncateMode('-11').getErrors('test'),
    ).toBeUndefined();
  });
});
