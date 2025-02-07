import dayjs from 'dayjs';
import { isDate, isISO8601 } from 'validator';
import type { ValidationError } from './index.js';
import ValueObject from './index.js';

// Inner type = string: consider serialization
export default abstract class DateObject extends ValueObject<
  dayjs.ConfigType,
  dayjs.Dayjs,
  string
> {
  protected override fromInput(): string {
    return dayjs(this.input).toISOString();
  }

  protected override toOutput(): dayjs.Dayjs {
    return dayjs(this.inner);
  }

  public getErrors(name: string): ValidationError[] | undefined {
    if (
      typeof this.input === 'string' &&
      !(isDate(this.input) || isISO8601(this.input))
    ) {
      return [{ name, error: '日付の形式が正しくありません' }];
    }

    return undefined;
  }

  public compare(value: this): number {
    if (this.value.isSame(value.value)) {
      return 0;
    }

    if (this.value.isBefore(value.value)) {
      return -1;
    }

    return 1;
  }
}
