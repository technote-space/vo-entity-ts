import { describe, expect, it } from 'vitest';
import type { ValidationError } from './index.js';
import { ObjectValue } from './object.js';

interface TestObject {
  name: string;
  age: number;
  active?: boolean;
}

class TestObjectValue extends ObjectValue<TestObject> {
  protected override get symbol(): symbol {
    return Symbol();
  }

  protected override getRequiredKeys(): (keyof TestObject)[] {
    return ['name', 'age'];
  }

  protected override validateValue(value: TestObject): ValidationError[] {
    const errors: ValidationError[] = [];

    if (value.age < 0) {
      errors.push({ name: 'age', error: '年齢は0以上である必要があります' });
    }

    if (value.name.length === 0) {
      errors.push({ name: 'name', error: '名前は空文字列にできません' });
    }

    return errors;
  }
}

class NullableTestObjectValue extends ObjectValue<TestObject, true> {
  protected override get symbol(): symbol {
    return Symbol();
  }
}

describe('ObjectValue', () => {
  it('should create valid object value', () => {
    const obj = new TestObjectValue({ name: 'John', age: 30, active: true });
    expect(obj.value).toEqual({ name: 'John', age: 30, active: true });
  });

  it('should validate required keys', () => {
    const obj = new TestObjectValue({ name: 'John' } as TestObject);
    const errors = obj.getErrors('test');

    expect(errors).toHaveLength(1);
    expect(errors?.[0]?.name).toBe('test.age');
    expect(errors?.[0]?.error).toBe('値を指定してください');
  });

  it('should run custom validation', () => {
    const obj = new TestObjectValue({ name: '', age: -5 });
    const errors = obj.getErrors('test');

    expect(errors).toHaveLength(2);
    expect(errors?.[0]?.name).toBe('test.age');
    expect(errors?.[0]?.error).toBe('年齢は0以上である必要があります');
    expect(errors?.[1]?.name).toBe('test.name');
    expect(errors?.[1]?.error).toBe('名前は空文字列にできません');
  });

  it('should create valid object value', () => {
    const obj = new NullableTestObjectValue({
      name: 'John',
      age: 30,
      active: true,
    });
    expect(obj.value).toEqual({ name: 'John', age: 30, active: true });
    expect(obj.getErrors('test')).toBeUndefined();
  });

  it('should handle null values when nullable', () => {
    const obj = new NullableTestObjectValue(null);
    expect(obj.value).toBeNull();
    expect(obj.getErrors('test')).toBeUndefined();
  });

  it('should compare objects correctly', () => {
    const obj1 = new TestObjectValue({ name: 'John', age: 30 });
    const obj2 = new TestObjectValue({ name: 'John', age: 30 });
    const obj3 = new TestObjectValue({ name: 'Jane', age: 25 });

    expect(obj1.equals(obj2)).toBe(true);
    expect(obj1.equals(obj3)).toBe(false);
    expect(obj1.compare(obj2)).toBe(0);
    expect(obj1.compare(obj3)).not.toBe(0);
  });

  it('should handle comparison with null values', () => {
    const obj1 = new NullableTestObjectValue(null);
    const obj2 = new NullableTestObjectValue(null);
    const obj3 = new NullableTestObjectValue({ name: 'John', age: 30 });

    expect(obj1.equals(obj2)).toBe(true);
    expect(obj1.equals(obj3)).toBe(false);
    expect(obj3.equals(obj1)).toBe(false);
  });
});
