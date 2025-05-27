import { compareNullable } from './helper.js';
import {
  type NullableOrNot,
  type ValidationError,
  ValueObject,
} from './index.js';

export abstract class ObjectValue<
  // biome-ignore lint/suspicious/noExplicitAny:
  T extends Record<string, any>,
  Nullable extends boolean = false,
> extends ValueObject<NullableOrNot<T, Nullable>, NullableOrNot<T, Nullable>> {
  protected override fromInput(): NullableOrNot<T, Nullable> {
    const input = this.input;
    if (input === null) {
      return null as NullableOrNot<T, Nullable>;
    }

    return input;
  }

  protected getRequiredKeys(): (keyof T)[] {
    return [];
  }

  protected validateValue(_value: T): ValidationError[] {
    return [];
  }

  public getErrors(name: string): ValidationError[] | undefined {
    const obj: T | null = this.fromInput();
    if (obj === null) {
      return undefined;
    }

    const results: ValidationError[] = [];

    // Check required keys
    const requiredKeys = this.getRequiredKeys();
    for (const key of requiredKeys) {
      if (!(key in obj) || obj[key] === undefined || obj[key] === null) {
        results.push({
          name: `${name}.${String(key)}`,
          error: '値を指定してください',
        });
      }
    }

    // Custom validation
    const customErrors = this.validateValue(obj);
    results.push(
      ...customErrors.map((error) => ({
        ...error,
        name: `${name}.${error.name}`,
      })),
    );

    return results.length ? results : undefined;
  }

  public compare(value: this): number {
    if (this.value === null || value.value === null) {
      return compareNullable(this.value, value.value);
    }

    // Compare by JSON string representation
    const thisStr = JSON.stringify(this.value);
    const valueStr = JSON.stringify(value.value);

    return thisStr.localeCompare(valueStr);
  }
}
