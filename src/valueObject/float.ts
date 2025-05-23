import validator from 'validator';
import { compareNullable } from './helper.js';
import {
  type NullableOrNot,
  type ValidationError,
  ValueObject,
} from './index.js';

export abstract class Float<
  Nullable extends boolean = false,
> extends ValueObject<
  NullableOrNot<number | string, Nullable>,
  NullableOrNot<number, Nullable>
> {
  protected override fromInput(): NullableOrNot<number, Nullable> {
    const input = this.input;
    if (input === null) {
      return null as NullableOrNot<number, Nullable>;
    }

    if (typeof input === 'number') {
      return input;
    }

    let num = Number.parseFloat(input);
    const max = this.getMaxNumber();
    if (max !== undefined && num > max && this.isTruncateMode()) {
      num = Math.min(max, num);
    }

    const min = this.getMinNumber();
    if (min !== undefined && num < min && this.isTruncateMode()) {
      num = Math.max(min, num);
    }

    return num;
  }

  protected getMaxNumber(): number | undefined {
    return undefined;
  }

  protected getMinNumber(): number | undefined {
    return undefined;
  }

  protected isTruncateMode(): boolean {
    return false;
  }

  public getErrors(name: string): ValidationError[] | undefined {
    const num = this.fromInput();
    if (num === null) {
      return undefined;
    }

    if (typeof this.input === 'string' && !validator.isNumeric(this.input)) {
      return [{ name, error: '数値の形式が正しくありません' }];
    }

    const max = this.getMaxNumber();
    if (max !== undefined && num > max) {
      return [{ name, error: `${max}以下の値を入力してください` }];
    }

    const min = this.getMinNumber();
    if (min !== undefined && num < min) {
      return [{ name, error: `${min}以上の値を入力してください` }];
    }

    return undefined;
  }

  public compare(value: this): number {
    if (this.value === null || value.value === null) {
      return compareNullable(this.value, value.value);
    }

    const diff = this.value - value.value;
    if (diff < 0) return -1;
    if (diff > 0) return 1;
    return 0;
  }
}
