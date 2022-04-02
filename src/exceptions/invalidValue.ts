import Exception from './exception';

export default class InvalidValueException extends Exception {
  public constructor(target: string, reason?: string) {
    super(400, '無効な値です', { target, reason });
  }
}
