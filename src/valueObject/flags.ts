import { compareNullable } from './helper.js';
import {
  type NullableOrNot,
  type ValidationError,
  ValueObject,
} from './index.js';

export abstract class Flags<
  FlagTypes extends string,
  Nullable extends boolean = false,
> extends ValueObject<
  NullableOrNot<FlagTypes, Nullable>,
  NullableOrNot<FlagTypes, Nullable>
> {
  public abstract get flagTypes(): FlagTypes[];

  public getErrors(name: string): ValidationError[] | undefined {
    if (this.input === null) {
      return undefined;
    }

    if (!(this.flagTypes as string[]).includes(this.input)) {
      return [{ name, error: `定義されていないフラグです: ${this.input}` }];
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
