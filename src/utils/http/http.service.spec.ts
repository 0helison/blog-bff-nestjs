import { Http } from './http.service';
import { TimeoutException } from './exceptions/timeout-exception';
import { Client, Dispatcher } from 'undici';

jest.mock('node:timers/promises', () => ({
  setTimeout: jest.fn(() => Promise.resolve()),
}));

jest.mock('undici', () => {
  return {
    Client: jest.fn(() => ({
      request: jest.fn(),
    })),
    Dispatcher: {
      RequestOptions: jest.fn(),
      ResponseData: jest.fn(),
    },
  };
});

describe('Http Unit Tests', () => {
  const url: string = 'http://localhost';
  let http: Http;
  let clientMock: jest.Mocked<Client>;
  let cancelTimeout: AbortController;
  let cancelRequest: AbortController;

  beforeAll(() => {
    jest.spyOn(global.console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    http = new Http(url);
    clientMock = http['client'] as jest.Mocked<Client>;
    cancelTimeout = new AbortController();
    cancelRequest = new AbortController();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('constructor', () => {
    expect(http).toBeInstanceOf(Http);
    expect(Client).toHaveBeenCalledWith(url);
  });

  it('should return a response if makeRequest succeeds before timeout', async () => {
    const params: Dispatcher.RequestOptions = { method: 'GET', path: '/test' };
    const timeoutMs = 5000;
    const jsonResponse = { id: 1, name: 'Test' };

    jest.spyOn(http as any, 'makeRequest').mockResolvedValue(jsonResponse);
    jest
      .spyOn(http as any, 'timeout')
      .mockImplementation(() => new Promise(() => {}));

    const result = await http.sendRequest<typeof jsonResponse>(params, {
      timeout: timeoutMs,
    });

    expect(result).toEqual(jsonResponse);
    expect(http['makeRequest']).toHaveBeenCalledWith(params, {
      cancelTimeout: expect.any(AbortController),
      cancelRequest: expect.any(AbortController),
    });
    expect(http['timeout']).toHaveBeenCalledWith(timeoutMs, {
      cancelTimeout: expect.any(AbortController),
      cancelRequest: expect.any(AbortController),
    });
  });

  it('should throw a TimeoutException if timeout happens first', async () => {
    const params: Dispatcher.RequestOptions = { method: 'GET', path: '/test' };
    const timeoutMs = 100;

    jest
      .spyOn(http as any, 'makeRequest')
      .mockImplementation(() => new Promise(() => {}));
    jest
      .spyOn(http as any, 'timeout')
      .mockRejectedValue(new TimeoutException());

    await expect(
      http.sendRequest(params, { timeout: timeoutMs }),
    ).rejects.toThrow(TimeoutException);

    expect(http['makeRequest']).toHaveBeenCalledWith(params, {
      cancelTimeout: expect.any(AbortController),
      cancelRequest: expect.any(AbortController),
    });
    expect(http['timeout']).toHaveBeenCalledWith(timeoutMs, {
      cancelTimeout: expect.any(AbortController),
      cancelRequest: expect.any(AbortController),
    });
  });

  it('should propagate other errors from makeRequest', async () => {
    const params: Dispatcher.RequestOptions = { method: 'GET', path: '/test' };
    const timeoutMs = 5000;
    const error = new Error('Network Error');

    jest.spyOn(http as any, 'makeRequest').mockRejectedValue(error);
    jest
      .spyOn(http as any, 'timeout')
      .mockImplementation(() => new Promise(() => {}));

    await expect(
      http.sendRequest(params, { timeout: timeoutMs }),
    ).rejects.toThrow(error);

    expect(http['makeRequest']).toHaveBeenCalledWith(params, {
      cancelTimeout: expect.any(AbortController),
      cancelRequest: expect.any(AbortController),
    });
    expect(http['timeout']).toHaveBeenCalledWith(timeoutMs, {
      cancelTimeout: expect.any(AbortController),
      cancelRequest: expect.any(AbortController),
    });
  });

  it('should make a request and return JSON response', async () => {
    const params: Dispatcher.RequestOptions = {
      method: 'GET',
      path: '/test',
    };

    const jsonResponse = { id: 1, name: 'Test' };

    const responseMock = {
      body: {
        json: jest.fn().mockResolvedValue(jsonResponse),
      },
    } as unknown as Dispatcher.ResponseData;

    (clientMock.request as jest.Mock).mockResolvedValue(responseMock);

    const abortSpy = jest.spyOn(cancelTimeout, 'abort');

    const result = await http['makeRequest'](params, {
      cancelTimeout,
      cancelRequest,
    });

    expect(clientMock.request).toHaveBeenCalledWith({
      ...params,
      signal: cancelRequest.signal,
    });

    expect(responseMock.body.json).toHaveBeenCalled();
    expect(result).toEqual(jsonResponse);
    expect(abortSpy).toHaveBeenCalled();
  });

  it('should throw a TimeoutException when timeout occurs', async () => {
    const abortSpy = jest.spyOn(cancelRequest, 'abort');

    await expect(
      http['timeout'](100, { cancelTimeout, cancelRequest }),
    ).rejects.toThrow(TimeoutException);

    expect(abortSpy).toHaveBeenCalled();
  });
});
