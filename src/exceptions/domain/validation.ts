import Exception from './exception';

export type ValidationErrors = {
  [name: string]: string[];
};

export default class ValidationException extends Exception {
  public constructor(public readonly errors?: ValidationErrors) {
    super(422, 'バリデーションエラーが発生しました', errors);
  }
}
