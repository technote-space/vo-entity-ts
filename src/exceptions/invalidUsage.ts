import Exception from './exception';

export default class InvalidUsage extends Exception {
  public constructor(reason?: string) {
    super(500, '使用方法が正しくありません', { reason });
  }
}
