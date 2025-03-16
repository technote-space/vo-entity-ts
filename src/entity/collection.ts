import type { ValidationErrors } from '../exceptions/validation.js';
import type { Entity } from './index.js';

export abstract class Collection<T extends Entity> {
  public constructor(public readonly collections: T[]) {
    Object.freeze(this.collections);
  }

  [Symbol.iterator]() {
    return this.collections.values();
  }

  public find(filter: (item: T) => boolean): T | undefined {
    return this.collections.find(filter);
  }

  public filter(filter: (item: T) => boolean): T[] {
    return this.collections.filter(filter);
  }

  public map<U>(callback: (item: T, index: number) => U): U[] {
    return this.collections.map(callback);
  }

  public sorted(callback: (a: T, b: T) => number): T[] {
    return this.collections.slice().sort(callback);
  }

  public isEmpty(): boolean {
    return !this.collections.length;
  }

  public count(): number {
    return this.collections.length;
  }

  public getErrors(prev?: Collection<T>): ValidationErrors | undefined {
    const getPrev = (item: T) =>
      (prev?.collections ?? []).find((x) => item.equals(x));
    const errors = this.collections.reduce(
      (acc, item, index) => ({
        // biome-ignore lint/performance/noAccumulatingSpread:
        ...acc,
        ...Object.fromEntries(
          Object.entries(item.getErrors(getPrev(item))).map(([key, value]) => [
            `${key}[${index}]`,
            value,
          ]),
        ),
      }),
      {} as ValidationErrors,
    );

    if (Object.keys(errors).length) {
      return errors;
    }

    return undefined;
  }
}
