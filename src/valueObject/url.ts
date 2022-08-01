import type { ValidationError } from '.';
import isURL from 'validator/lib/isURL';
import ValueObject from '.';

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
