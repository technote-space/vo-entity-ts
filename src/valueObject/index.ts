export type NullableOrNot<T, Nullable extends boolean> = Nullable extends true
  ? T | null
  : T;

export type ValidationError = {
  name: string;
  error: string;
};
export abstract class ValueObject<Input, Output, Inner = Output, O = Output> {
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
      Object.freeze(this._inner);
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

  public get objectValue(): O {
    return this.value as never;
  }

  public equals(value?: this | null): boolean {
    if (value == null) return false;
    return this.compare(value) === 0;
  }

  public abstract compare(value: this): number;

  public abstract getErrors(
    name: string,
    prev?: Readonly<ValueObject<Input, Output, Inner>>,
  ): ValidationError[] | undefined;
}
