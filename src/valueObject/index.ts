/* eslint-disable @typescript-eslint/no-non-null-assertion,@typescript-eslint/no-explicit-any */
import InvalidUsage from '../exceptions/invalidUsage';
import ValidationException from '../exceptions/validation';

export type ValidationError = {
  name: string;
  error: string;
};
export default abstract class ValueObject<Input, Output, Inner = Output> {
  private static _isCreating = false;
  private _setInner = false;
  private _inner?: Inner;
  private _setOutput = false;
  private _output?: Output;

  // create メソッドの this コンテキストのせいで protected にはできない
  /**
   * @deprecated create 経由で生成
   */
  public constructor(private readonly _input: Input) {
    if (!ValueObject._isCreating) {
      throw new InvalidUsage();
    }
  }

  //noinspection JSUnusedGlobalSymbols
  protected abstract get symbol(): symbol;

  protected fromInput(): Inner {
    return this.input as never;
  }

  protected toOutput(): Output {
    return this.inner as never;
  }

  protected get input(): Input {
    return this._input;
  }

  protected get inner(): Inner {
    if (!this._setInner) {
      this._setInner = true;
      this._inner = this.fromInput();
    }

    return this._inner!;
  }

  public get value(): Output {
    if (!this._setOutput) {
      this._setOutput = true;
      this._output = this.toOutput();
      Object.freeze(this._output);
    }

    return this._output!;
  }

  public equals(value: this): boolean {
    return this.compare(value) === 0;
  }

  public abstract compare(value: this): number;

  public abstract getErrors(name: string, prev?: ValueObject<Input, Output, Inner>): ValidationError[] | undefined;

  public validate(name: string, prev?: ValueObject<Input, Output, Inner>): void | never {
    const errors = this.getErrors(name, prev);
    if (errors && errors.length) {
      throw new ValidationException(errors.reduce((acc, error) => {
        return {
          ...acc,
          [error.name]: [...new Set([...(acc[error.name] ?? []), error.error])],
        };
      }, {}));
    }
  }

  public static create<Input, Instance extends ValueObject<any, any, any>>(
    this: new(value: Input) => Instance,
    value: Input,
  ): Instance {
    try {
      ValueObject._isCreating = true;
      return new this(value);
    } finally {
      ValueObject._isCreating = false;
    }
  }
}
