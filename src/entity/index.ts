/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ValidationErrors } from '../exceptions/validation';
import ValidationException from '../exceptions/validation';
import ValueObject from '../valueObject';
import type { ValidationError } from '../valueObject';
import InvalidUsage from '../exceptions/invalidUsage';
import Collection from './collection';

export default abstract class Entity<Args extends any[] = any> {
  private static _isCreating = false;

  protected constructor() {
    if (!Entity._isCreating) {
      throw new InvalidUsage();
    }
  }

  protected static _create<Args extends any[], Instance extends Entity<Args>>(
    this: new(...args: Args) => Instance,
    ...args: Args
  ) {
    try {
      Entity._isCreating = true;
      const instance = new this(...args);
      instance.validate();
      return instance;
    } finally {
      Entity._isCreating = false;
    }
  }

  protected static _reconstruct<Args extends any[], Instance extends Entity<Args>>(
    this: new(...args: Args) => Instance,
    ...args: Args
  ) {
    try {
      Entity._isCreating = true;
      return new this(...args);
    } finally {
      Entity._isCreating = false;
    }
  }

  protected static _update<Args extends any[], Instance extends Entity<Args>>(
    this: new(...args: Args) => Instance,
    target: Entity<Args>,
    ...args: Args
  ) {
    try {
      Entity._isCreating = true;
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
      const member = this[key] as any;
      const prevValue = prev ? prev[key] ?? undefined : undefined;

      if (member && member instanceof Collection) {
        const errors: ValidationErrors | undefined = member.getErrors(prevValue);
        if (errors) {
          return Object.entries(errors).reduce((acc, [key, value]) => {
            return {
              ...acc,
              [key]: [...new Set([...(acc[key] ?? []), ...value])],
            };
          }, acc);
        }
      }

      if (member && member instanceof ValueObject) {
        const name = key.replace(/^_/, '');
        const errors: ValidationError[] | undefined = member.getErrors(name, prevValue);
        if (errors?.length) {
          return errors.reduce((acc, error) => {
            return {
              ...acc,
              [error.name]: [...new Set([...(acc[error.name] ?? []), error.error])],
            };
          }, acc);
        }
      }

      return acc;
    }, {} as ValidationErrors);
  }

  private validate(prev?: Entity<Args>): void | never {
    const errors = this.getErrors(prev);
    if (Object.keys(errors).length) {
      throw new ValidationException(errors);
    }
  }
}
