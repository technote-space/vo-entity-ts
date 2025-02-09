import InvalidValueException from '../exceptions/invalidValue.js';
import type { ValidationError } from './index.js';
import ValueObject from './index.js';

export default abstract class StringId extends ValueObject<
  number | string | null,
  string,
  string | null
> {
  protected override fromInput(): string | null {
    if (this.input === null) {
      return null;
    }

    return `${this.input}`;
  }

  protected override toOutput(): string {
    if (this.inner === null) {
      throw new InvalidValueException('id');
    }

    return super.toOutput();
  }

  public isSet(): boolean {
    return this.input !== null && this.input !== undefined;
  }

  public getErrors(name: string): ValidationError[] | undefined {
    const text = this.fromInput();
    if (text === null) {
      return undefined;
    }

    if (!text.length) {
      return [{ name, error: '値を指定してください' }];
    }

    return undefined;
  }

  public compare(value: this): number {
    return this.value.localeCompare(value.value);
  }
}
