import validator from 'validator';
import type { ValidationError } from './index.js';
import { Text } from './text.js';

export abstract class Email<
  Nullable extends boolean = false,
> extends Text<Nullable> {
  protected override getValidationMaxLength(): number | undefined {
    return 180;
  }

  public override getErrors(name: string): ValidationError[] | undefined {
    const results = super.getErrors(name);
    if (results?.length) {
      return results;
    }

    const text = this.fromInput();
    if (text === null) {
      return undefined;
    }

    if (!validator.isEmail(text)) {
      return [{ name, error: 'メールアドレスの形式が正しくありません' }];
    }

    return undefined;
  }
}
