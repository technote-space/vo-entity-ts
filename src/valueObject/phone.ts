import validator from 'validator';
import { compareNullable } from './helper.js';
import {
  type NullableOrNot,
  type ValidationError,
  ValueObject,
} from './index.js';

export abstract class Phone<
  Nullable extends boolean = false,
> extends ValueObject<
  NullableOrNot<string, Nullable>,
  NullableOrNot<string, Nullable>
> {
  protected override fromInput(): NullableOrNot<string, Nullable> {
    const input = this.input;
    if (input === null) {
      return null as NullableOrNot<string, Nullable>;
    }

    // Keep original input as is
    return input.trim();
  }

  public get normalized(): NullableOrNot<string, Nullable> {
    const value = this.value;
    if (value === null) {
      return null as NullableOrNot<string, Nullable>;
    }

    // Normalize phone number (remove spaces, dashes, parentheses)
    return value.replace(/[\s\-()]/g, '') as NullableOrNot<string, Nullable>;
  }

  protected getLocale():
    | 'any'
    | validator.MobilePhoneLocale
    | validator.MobilePhoneLocale[] {
    return 'any';
  }

  protected getStrictMode(): boolean {
    return false;
  }

  public getErrors(name: string): ValidationError[] | undefined {
    const phone = this.fromInput();
    if (phone === null) {
      return undefined;
    }

    const results: ValidationError[] = [];

    if (!phone.length) {
      results.push({ name, error: '電話番号を指定してください' });
    } else {
      const locale = this.getLocale();
      const strictMode = this.getStrictMode();

      if (!validator.isMobilePhone(phone, locale, { strictMode })) {
        results.push({ name, error: '有効な電話番号を入力してください' });
      }
    }

    return results.length ? results : undefined;
  }

  public compare(value: this): number {
    if (this.value === null || value.value === null) {
      return compareNullable(this.value, value.value);
    }

    return this.value.localeCompare(value.value);
  }
}
