import type { ValidationError } from '.';
import isInt from 'validator/lib/isInt';
import Float from './float';

export default abstract class Int extends Float {
  protected fromInput(): number {
    return Math.floor(super.fromInput());
  }

  public validate(name: string): ValidationError[] | undefined {
    const results = super.validate(name);
    if (results?.length) {
      return results;
    }

    if (typeof this.input === 'string' && !isInt(this.input)) {
      return [{ name, error: '整数の形式が正しくありません' }];
    }

    const num = this.fromInput();
    if (!Number.isSafeInteger(num)) {
      return [{ name, error: '有効な整数ではありません' }];
    }

    return undefined;
  }
}
