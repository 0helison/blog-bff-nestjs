import { Injectable } from '@nestjs/common';
import { setTimeout } from 'node:timers/promises';
import { Client, Dispatcher } from 'undici';
import { TimeoutException } from './exceptions/timeout-exception';

@Injectable()
export class Http {
  private client: Client;

  constructor(url: string) {
    this.client = new Client(url);
  }

  async request<T>(
    params: Dispatcher.RequestOptions,
    options: { timeout: number },
  ): Promise<T> {
    const cancelTimeout = new AbortController();
    const cancelRequest = new AbortController();

    try {
      const response = await Promise.race([
        this.makeRequest<T>(params, { cancelTimeout, cancelRequest }),
        this.timeout(options.timeout, { cancelTimeout, cancelRequest }),
      ]);

      return response as T;
    } catch (error) {
      if (error instanceof TimeoutException) {
        console.log('Timeout exceeded');
      }

      throw error;
    }
  }

  private async makeRequest<T>(
    params: Dispatcher.RequestOptions,
    {
      cancelTimeout,
      cancelRequest,
    }: { cancelTimeout: AbortController; cancelRequest: AbortController },
  ): Promise<T> {
    return this.client
      .request({
        ...params,
        signal: cancelRequest.signal,
      })
      .then((response) => response.body.json() as Promise<T>)
      .finally(() => cancelTimeout.abort());
  }

  private async timeout(
    timeout: number,
    {
      cancelTimeout,
      cancelRequest,
    }: { cancelTimeout: AbortController; cancelRequest: AbortController },
  ): Promise<void | TimeoutException> {
    await setTimeout(timeout, undefined, {
      signal: cancelTimeout.signal,
    }).catch(() => {});

    cancelRequest.abort();

    throw new TimeoutException();
  }
}
