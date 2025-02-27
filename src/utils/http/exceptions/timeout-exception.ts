export class TimeoutException extends Error {
  constructor() {
    super('Timeout exceeded');
  }
}
