import { Exception } from './exception.js';

export type ValidationErrors = {
  [name: string]: string[];
};

export class ValidationException extends Exception {
  public constructor(public readonly errors?: ValidationErrors) {
    super(422, 'バリデーションエラーが発生しました', errors);
  }
}
