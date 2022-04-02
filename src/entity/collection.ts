import type { ValidationErrors } from '../exceptions/domain/validation';
import type Entity from '.';
import InvalidUsage from '../exceptions/domain/invalidUsage';

export default abstract class Collection<T extends Entity> {
  private static _isCreating = false;

  // create メソッドの this コンテキストのせいで protected にはできない
  /**
   * @deprecated create 経由で生成
   */
  public constructor(private readonly collections: Array<T>) {
    if (!Collection._isCreating) {
      throw new InvalidUsage('create経由で生成してください');
    }

    Object.freeze(this.collections);
  }

  [Symbol.iterator]() {
    return this.collections.values();
  }

  public isEmpty(): boolean {
    return !this.collections.length;
  }

  public validate(prev?: Collection<T>): ValidationErrors | undefined {
    const getPrev = (item: T) => (prev?.collections ?? []).find(x => item.equals(x));
    const errors = this.collections.reduce((acc, item, index) => ({
      ...acc,
      ...Object.fromEntries(Object.entries(item.getErrors(getPrev(item))).map(([key, value]) => [`${key}[${index}]`, value])),
    }), {} as ValidationErrors);

    if (Object.keys(errors).length) {
      return errors;
    }

    return undefined;
  }

  public static create<T extends Entity, Instance extends Collection<T>>(
    this: new(collections: T[]) => Instance,
    collections: T[],
  ): Instance {
    try {
      Collection._isCreating = true;
      return new this(collections);
    } finally {
      Collection._isCreating = false;
    }
  }
}

