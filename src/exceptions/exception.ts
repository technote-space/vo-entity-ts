type ToNumber<T extends string> = T extends `${infer N extends number}`
  ? N
  : never;
type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type ClientErrorStatusCode =
  | `40${Digit}`
  | `41${Digit}`
  | `42${Digit}`
  | '431'
  | '451';
type ServerErrorStatusCode = `50${Digit}` | '510' | '511';
type HttpErrorStatusCode = ClientErrorStatusCode | ServerErrorStatusCode;
export type ErrorStatus = ToNumber<HttpErrorStatusCode>;

export class Exception extends Error {
  public constructor(
    public readonly status: ErrorStatus,
    message: string,
    // biome-ignore lint/suspicious/noExplicitAny:
    public readonly context?: Record<string, any>,
  ) {
    super(message);
  }
}
