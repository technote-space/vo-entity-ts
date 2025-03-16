export type ErrorStatus = 400 | 401 | 403 | 404 | 409 | 422 | 500;

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
