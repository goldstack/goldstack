export class CannotObtainTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CannotObtainTokenError';

    // Set the prototype explicitly for standard Error inheritance in TS
    Object.setPrototypeOf(this, CannotObtainTokenError.prototype);
  }
}
