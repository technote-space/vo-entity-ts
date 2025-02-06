export type ErrorStatus = 400 | 401 | 403 | 404 | 409 | 422 | 500;

export default class Exception extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(
    public readonly status: ErrorStatus,
    message: string,
    public readonly context?: Record<string, any>,
  ) {
    super(message);
  }
}
