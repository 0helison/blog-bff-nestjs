import Redis from 'ioredis';
import { RedisService } from './redis.service';

describe('RedisService Unit Tests', () => {
  let redisService: RedisService;
  let redisClientMock: Redis;

  beforeEach(() => {
    jest.spyOn(Redis.prototype, 'get').mockResolvedValue(null);
    jest.spyOn(Redis.prototype, 'set').mockResolvedValue('OK');
    jest.spyOn(Redis.prototype, 'pipeline').mockReturnValue({
      set: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    } as any);
    jest.spyOn(Redis.prototype, 'quit').mockResolvedValue(null);

    redisService = new RedisService();
    redisClientMock = redisService.getClient();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await redisClientMock.quit();
  });

  it('should return a valid Redis client from getClient()', () => {
    expect(redisClientMock).toBeInstanceOf(Redis);
    expect(redisClientMock.options.host).toBe('redis');
    expect(redisClientMock.options.port).toBe(6379);
  });

  it('should return cached data if key exists', async () => {
    const cachedValue = JSON.stringify({ message: 'cached data' });
    (redisClientMock.get as jest.Mock).mockResolvedValue(cachedValue);

    const result = await redisService.getOrSetCache(
      'test-key',
      'test-key-stale',
      60,
      120,
      async () => ({ message: 'new data' }),
    );

    expect(result).toEqual({ message: 'cached data' });
    expect(redisClientMock.get).toHaveBeenCalledWith('test-key');
  });

  it('should call fetchFunction and set new data if key does not exist', async () => {
    const fetchFunction = jest.fn().mockResolvedValue({ message: 'new data' });

    const result = await redisService.getOrSetCache(
      'test-key',
      'test-key-stale',
      60,
      120,
      fetchFunction,
    );

    expect(fetchFunction).toHaveBeenCalled();
    expect(result).toEqual({ message: 'new data' });

    expect(redisClientMock.pipeline).toHaveBeenCalled();
    expect(redisClientMock.pipeline().set).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify({ message: 'new data' }),
      'EX',
      60,
    );
    expect(redisClientMock.pipeline().set).toHaveBeenCalledWith(
      'test-key-stale',
      JSON.stringify({ message: 'new data' }),
      'EX',
      120,
    );
    expect(redisClientMock.pipeline().exec).toHaveBeenCalled();
  });
});
