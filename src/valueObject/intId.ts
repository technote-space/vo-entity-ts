import { isInt } from 'validator';
import InvalidValueException from '../exceptions/invalidValue.js';
import type { ValidationError } from './index.js';
import ValueObject from './index.js';

export default abstract class IntId extends ValueObject<
  number | string | null,
  number,
  number | null
> {
  protected override fromInput(): number | null {
    const _input = this.input;
    if (_input === null) {
      return null;
    }

    if (typeof _input === 'number') {
      return Math.floor(_input);
    }

    return Math.floor(Number.parseFloat(_input));
  }

  protected override toOutput(): number {
    if (this.inner === null) {
      throw new InvalidValueException('id');
    }

    return super.toOutput();
  }

  public isSet(): boolean {
    return this.input !== null && this.input !== undefined;
  }

  public getErrors(name: string): ValidationError[] | undefined {
    const num = this.fromInput();
    if (num === null) {
      return undefined;
    }

    if (typeof this.input === 'string' && !isInt(this.input)) {
      return [{ name, error: '整数の形式が正しくありません' }];
    }

    if (!Number.isSafeInteger(num)) {
      return [{ name, error: '有効な整数ではありません' }];
    }

    return undefined;
  }

  public compare(value: this): number {
    const diff = this.value - value.value;
    if (diff < 0) return -1;
    if (diff > 0) return 1;
    return 0;
  }
}
