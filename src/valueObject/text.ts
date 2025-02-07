import type { ValidationError } from './index.js';
import ValueObject from './index.js';

export default abstract class Text extends ValueObject<
  number | string,
  string
> {
  protected override fromInput(): string {
    if (typeof this.input === 'number') {
      return `${this.input}`;
    }

    if (this.input) {
      return `${this.input}`;
    }

    return '';
  }

  protected getValidationMinLength(): number | undefined {
    return undefined;
  }

  protected getValidationMaxLength(): number | undefined {
    return undefined;
  }

  public getErrors(name: string): ValidationError[] | undefined {
    const text = this.fromInput();
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

    return results;
  }

  public compare(value: this): number {
    return this.value.localeCompare(value.value);
  }
}
