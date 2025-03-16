import { InvalidUsage } from '../exceptions/invalidUsage.js';
import type { ValidationErrors } from '../exceptions/validation.js';
import { ValidationException } from '../exceptions/validation.js';
import type { ValidationError } from '../valueObject/index.js';
import { ValueObject } from '../valueObject/index.js';
import { Collection } from './collection.js';

// biome-ignore lint/suspicious/noExplicitAny:
type Constructor<Args extends any[], Instance extends Entity<Args>> = new (
  ...args: Args
) => Instance;

// biome-ignore lint/suspicious/noExplicitAny:
export abstract class Entity<Args extends any[] = any> {
  private static _isCreating = false;

  protected constructor() {
    if (!Entity._isCreating) {
      throw new InvalidUsage();
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny:
  protected static _create<Args extends any[], Instance extends Entity<Args>>(
    this: Constructor<Args, Instance>,
    ...args: Args
  ) {
    try {
      Entity._isCreating = true;
      // biome-ignore lint/complexity/noThisInStatic:
      const instance = new this(...args);
      instance.validate();
      return instance;
    } finally {
      Entity._isCreating = false;
    }
  }

  protected static _reconstruct<
    // biome-ignore lint/suspicious/noExplicitAny:
    Args extends any[],
    Instance extends Entity<Args>,
  >(this: Constructor<Args, Instance>, ...args: Args) {
    try {
      Entity._isCreating = true;
      // biome-ignore lint/complexity/noThisInStatic:
      return new this(...args);
    } finally {
      Entity._isCreating = false;
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny:
  protected static _update<Args extends any[], Instance extends Entity<Args>>(
    this: Constructor<Args, Instance>,
    target: Entity<Args>,
    ...args: Args
  ) {
    try {
      Entity._isCreating = true;
      // biome-ignore lint/complexity/noThisInStatic:
      const instance = new this(...args);
      instance.validate(target);
      return instance;
    } finally {
      Entity._isCreating = false;
    }
  }

  public abstract equals(other: Entity<Args>): boolean;

  public getErrors(prev?: Entity<Args>): ValidationErrors {
    return Object.keys(this).reduce((acc, key) => {
      // biome-ignore lint/suspicious/noExplicitAny:
      const member = this[key as keyof Entity] as any;
      const prevValue = prev
        ? // biome-ignore lint/suspicious/noExplicitAny:
          ((prev[key as keyof Entity] as any) ?? undefined)
        : undefined;

      if (member && member instanceof Collection) {
        const errors: ValidationErrors | undefined =
          member.getErrors(prevValue);
        if (errors) {
          return Object.entries(errors).reduce((acc, [key, value]) => {
            acc[key] = [...new Set([...(acc[key] ?? []), ...value])];
            return acc;
          }, acc);
        }
      }

      if (member && member instanceof ValueObject) {
        const name = key.replace(/^_/, '');
        const errors: ValidationError[] | undefined = member.getErrors(
          name,
          prevValue,
        );
        if (errors?.length) {
          return errors.reduce((acc, error) => {
            acc[error.name] = [
              ...new Set([...(acc[error.name] ?? []), error.error]),
            ];
            return acc;
          }, acc);
        }
      }

      return acc;
    }, {} as ValidationErrors);
  }

  // biome-ignore lint/suspicious/noConfusingVoidType:
  private validate(prev?: Entity<Args>): void | never {
    const errors = this.getErrors(prev);
    if (Object.keys(errors).length) {
      throw new ValidationException(errors);
    }
  }
}
