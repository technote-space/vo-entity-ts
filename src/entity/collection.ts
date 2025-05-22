import type { ValidationErrors } from '../exceptions/validation.js';
import type { Entity } from './index.js';

export abstract class Collection<T extends Entity> extends Array<T> {
  public sorted(callback: (a: T, b: T) => number): T[] {
    return this.slice().sort(callback);
  }

  public isEmpty(): boolean {
    return !this.length;
  }

  public getErrors(prev?: Collection<T>): ValidationErrors | undefined {
    const getPrev = (item: T) => (prev ?? []).find((x) => item.equals(x));
    const errors = this.reduce(
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
