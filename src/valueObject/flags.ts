import type { ValidationError } from './index.js';
import ValueObject from './index.js';

export default abstract class Flags<
  FlagTypes extends string,
> extends ValueObject<string, FlagTypes> {
  public abstract get flagTypes(): FlagTypes[];

  public getErrors(name: string): ValidationError[] | undefined {
    if (!(this.flagTypes as string[]).includes(this.input)) {
      return [{ name, error: `定義されていないフラグです: ${this.input}` }];
    }

    return undefined;
  }

  public compare(value: this): number {
    return this.value.localeCompare(value.value);
  }
}
