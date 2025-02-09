import { isInt } from 'validator';
import Float from './float.js';
import type { ValidationError } from './index.js';

export default abstract class Int extends Float {
  protected override fromInput(): number {
    return Math.floor(super.fromInput());
  }

  public override getErrors(name: string): ValidationError[] | undefined {
    const results = super.getErrors(name);
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
