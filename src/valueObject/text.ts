import { compareNullable } from './helper.js';
import {
  type NullableOrNot,
  type ValidationError,
  ValueObject,
} from './index.js';

export abstract class Text<
  Nullable extends boolean = false,
> extends ValueObject<
  NullableOrNot<number | string, Nullable>,
  NullableOrNot<string, Nullable>
> {
  protected override fromInput(): NullableOrNot<string, Nullable> {
    const input = this.input;
    if (input === null) {
      return null as NullableOrNot<string, Nullable>;
    }

    return `${input}`;
  }

  protected getValidationMinLength(): number | undefined {
    return undefined;
  }

  protected getValidationMaxLength(): number | undefined {
    return undefined;
  }

  public getErrors(name: string): ValidationError[] | undefined {
    const text = this.fromInput();
    if (text === null) {
      return undefined;
    }

    const results: ValidationError[] = [];
    if (!text.length) {
      results.push({ name, error: '値を指定してください' });
    } else {
      const min = this.getValidationMinLength();
      if (min && text.length < min) {
        results.push({ name, error: `${min}文字より長く入力してください` });
      }
    }

    const max = this.getValidationMaxLength();
    if (max && text.length > max) {
      results.push({ name, error: `${max}文字より短く入力してください` });
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
