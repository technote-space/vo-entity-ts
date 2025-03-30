import validator from 'validator';
import { compareNullable } from './helper.js';
import {
  type NullableOrNot,
  type ValidationError,
  ValueObject,
} from './index.js';

export abstract class Url<Nullable extends boolean = false> extends ValueObject<
  NullableOrNot<string, Nullable>,
  NullableOrNot<string, Nullable>
> {
  public getErrors(name: string): ValidationError[] | undefined {
    if (this.input === null) {
      return undefined;
    }

    if (!validator.isURL(this.input)) {
      return [{ name, error: 'URLの形式が正しくありません' }];
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
