import { TimeoutException } from './timeout-exception';

describe('TimeoutException', () => {
  it('should create an instance of TimeoutException with the correct message', () => {
    const exception = new TimeoutException();

    expect(exception).toBeInstanceOf(TimeoutException);
    expect(exception.message).toBe('Timeout exceeded');
  });
});
