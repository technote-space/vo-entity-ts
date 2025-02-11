import dayjs from 'dayjs';
import { isDate, isISO8601 } from 'validator';
import { compareNullable } from './helper.js';
import {
  type NullableOrNot,
  type ValidationError,
  ValueObject,
} from './index.js';

// Inner type = string: consider serialization
export abstract class DateObject<
  Nullable extends boolean = false,
> extends ValueObject<
  NullableOrNot<dayjs.ConfigType, Nullable>,
  NullableOrNot<dayjs.Dayjs, Nullable>,
  NullableOrNot<string, Nullable>
> {
  protected override fromInput(): NullableOrNot<string, Nullable> {
    const input = this.input;
    if (input === null) {
      return null as NullableOrNot<string, Nullable>;
    }

    return dayjs(input).toISOString();
  }

  protected override toOutput(): NullableOrNot<dayjs.Dayjs, Nullable> {
    if (this.inner === null) {
      return null as NullableOrNot<dayjs.Dayjs, Nullable>;
    }

    return dayjs(this.inner);
  }

  public getErrors(name: string): ValidationError[] | undefined {
    if (
      typeof this.input === 'string' &&
      !(isDate(this.input) || isISO8601(this.input))
    ) {
      return [{ name, error: '日付の形式が正しくありません' }];
    }

    return undefined;
  }

  public compare(value: this): number {
    if (this.value === null || value.value === null) {
      return compareNullable(this.value, value.value);
    }

    if (this.value.isSame(value.value)) {
      return 0;
    }

    if (this.value.isBefore(value.value)) {
      return -1;
    }

    return 1;
  }
}
