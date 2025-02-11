/* eslint-disable @typescript-eslint/no-non-null-assertion,@typescript-eslint/no-explicit-any */
import {
  type ValidationErrors,
  ValidationException,
} from '../exceptions/validation.js';

export type NullableOrNot<T, Nullable extends boolean> = Nullable extends true
  ? T | null
  : T;

export type ValidationError = {
  name: string;
  error: string;
};
export abstract class ValueObject<Input, Output, Inner = Output> {
  private _setInner = false;
  private _inner?: Inner;
  private _setOutput = false;
  private _output?: Output;

  public constructor(private readonly _input: Input) {}

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

    // biome-ignore lint/style/noNonNullAssertion:
    return this._inner!;
  }

  public get value(): Output {
    if (!this._setOutput) {
      this._setOutput = true;
      this._output = this.toOutput();
      Object.freeze(this._output);
    }

    // biome-ignore lint/style/noNonNullAssertion:
    return this._output!;
  }

  public equals(value: this): boolean {
    return this.compare(value) === 0;
  }

  public abstract compare(value: this): number;

  public abstract getErrors(
    name: string,
    prev?: ValueObject<Input, Output, Inner>,
  ): ValidationError[] | undefined;

  public validate(
    name: string,
    prev?: ValueObject<Input, Output, Inner>,
  ): void | never {
    const errors = this.getErrors(name, prev);
    if (errors?.length) {
      throw new ValidationException(
        errors.reduce((acc, error) => {
          acc[error.name] = [
            ...new Set([...(acc[error.name] ?? []), error.error]),
          ];
          return acc;
        }, {} as ValidationErrors),
      );
    }
  }
}
