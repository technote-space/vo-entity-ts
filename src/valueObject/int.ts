import validator from 'validator';
import { Float } from './float.js';
import type { NullableOrNot, ValidationError } from './index.js';

export abstract class Int<
  Nullable extends boolean = false,
> extends Float<Nullable> {
  protected override fromInput(): NullableOrNot<number, Nullable> {
    const input = super.fromInput();
    if (input === null) {
      return null as NullableOrNot<number, Nullable>;
    }

    return Math.floor(input);
  }

  public override getErrors(name: string): ValidationError[] | undefined {
    if (this.input === null) {
      return undefined;
    }

    const results = super.getErrors(name);
    if (results?.length) {
      return results;
    }

    if (typeof this.input === 'string' && !validator.isInt(this.input)) {
      return [{ name, error: '整数の形式が正しくありません' }];
    }

    const num = this.fromInput();
    if (!Number.isSafeInteger(num)) {
      return [{ name, error: '有効な整数ではありません' }];
    }

    return undefined;
  }
}
