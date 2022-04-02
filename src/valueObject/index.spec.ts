import type { ValidationError } from '.';
import ValueObject from '.';

class Test extends ValueObject<number, number> {
  protected get symbol() {
    return Symbol();
  }

  public compare(): number {
    return 0;
  }

  public validate(): ValidationError[] | undefined {
    return undefined;
  }

  public getInner() {
    return this.inner;
  }
}

class TestArray extends ValueObject<number[], number[]> {
  protected get symbol() {
    return Symbol();
  }

  public compare(): number {
    return 0;
  }

  public validate(): ValidationError[] | undefined {
    return undefined;
  }
}

class TestObject extends ValueObject<{ test: number }, { test: number }> {
  protected get symbol() {
    return Symbol();
  }

  public compare(): number {
    return 0;
  }

  public validate(): ValidationError[] | undefined {
    return undefined;
  }
}

describe('ValueObject', () => {
  it('should cache', () => {
    const test = Test.create(123);
    expect(test.value).toBe(123);
    expect(test.value).toBe(123);
    expect(test.getInner()).toBe(123);
    expect(test.getInner()).toBe(123);
  });

  it('should reconstruct', () => {
    const test = Test.create(123);
    expect(test.value).toBe(123);
    expect(test.value).toBe(123);
  });

  it('should throw error if call constructor directory', () => {
    expect(() => new Test(123)).toThrow();
  });

  it('should throw error if push to array', () => {
    const test = TestArray.create([1, 2, 3]);
    expect(test.value).toEqual([1, 2, 3]);
    expect(test.value).toEqual([1, 2, 3]);

    expect(() => test.value.push(5)).toThrow();
  });

  it('should throw error if update object property', () => {
    const test = TestObject.create({ test: 123 });
    expect(test.value).toEqual({ test: 123 });
    expect(test.value).toEqual({ test: 123 });

    expect(() => {
      test.value.test = 345;
    }).toThrow();
  });
});
