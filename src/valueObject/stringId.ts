import { ulid } from 'ulid';
import { compareNullable } from './helper.js';
import {
  type NullableOrNot,
  type ValidationError,
  ValueObject,
} from './index.js';

export abstract class StringId<
  Nullable extends boolean = false,
> extends ValueObject<
  NullableOrNot<number | string | undefined, Nullable>,
  NullableOrNot<string, Nullable>,
  NullableOrNot<string, Nullable>
> {
  protected override fromInput(): NullableOrNot<string, Nullable> {
    if (this.input === undefined) {
      return ulid();
    }

    if (this.input === null) {
      return null as NullableOrNot<string, Nullable>;
    }

    return `${this.input}`;
  }

  public getErrors(name: string): ValidationError[] | undefined {
    const text = this.fromInput();
    if (text === null) {
      return undefined;
    }

    if (!text.length) {
      return [{ name, error: '値を指定してください' }];
    }

    return undefined;
  }

  public compare(value: this): number {
    if (this.value === null || value.value === null) {
      return compareNullable(this.value, value.value);
    }

    return this.value.localeCompare(value.value);
  }
}
