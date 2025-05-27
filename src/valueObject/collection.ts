import type { ValueObject } from './index.js';

export abstract class Collection<
  // biome-ignore lint/suspicious/noExplicitAny:
  T extends ValueObject<any, any>,
> extends Array<T> {
  public sorted(callback: (a: T, b: T) => number): T[] {
    return this.slice().sort(callback);
  }

  public isEmpty(): boolean {
    return !this.length;
  }

  public equals(other: this): boolean {
    if (this.length !== other.length) {
      return false;
    }

    return !this.some((item, i) => !item.equals(other[i]));
  }
}
