export default class ClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientError";
    Object.setPrototypeOf(this, ClientError.prototype);
  }

  static isClientError(error: unknown): error is ClientError {
    return error instanceof ClientError;
  }
}
