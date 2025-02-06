import { isURL } from 'validator';
import type { ValidationError } from './index.js';
import ValueObject from './index.js';

export default abstract class Url extends ValueObject<string, string> {
  public getErrors(name: string): ValidationError[] | undefined {
    if (!isURL(this.input)) {
      return [{ name, error: 'URLの形式が正しくありません' }];
    }

    return undefined;
  }

  public compare(value: this): number {
    return this.value.localeCompare(value.value);
  }
}
