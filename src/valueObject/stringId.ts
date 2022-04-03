import type { ValidationError } from '.';
import InvalidValueException from '../exceptions/invalidValue';
import ValueObject from '.';

export default abstract class StringId extends ValueObject<number | string | null, string, string | null> {
  protected fromInput(): string | null {
    if (this.input === null) {
      return null;
    }

    return `${this.input}`;
  }

  protected toOutput(): string {
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
