import { Http } from 'src/utils/http/http.service';
import { UsersService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersType } from 'src/utils/types/users-type';

describe('UsersService Unit Tests', () => {
  let usersService: UsersService;
  let httpMock: Http;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'HttpUsers',
          useValue: {
            sendRequest: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    httpMock = module.get<Http>('HttpUsers');
  });

  test('constructor', () => {
    expect(usersService).toBeDefined();
    expect(usersService['http']).toBe(httpMock);
  });

  it('should return user by id', async () => {
    const mockUser: UsersType = {
      id: 1,
      name: 'John',
    };

    (httpMock.sendRequest as jest.Mock).mockResolvedValue(mockUser);

    const result = await usersService.getUser(mockUser.id);

    expect(httpMock.sendRequest).toHaveBeenCalledTimes(1);
    expect(httpMock.sendRequest).toHaveBeenCalledWith(
      {
        method: 'GET',
        path: `/users/${mockUser.id}`,
      },
      { timeout: 2500 },
    );
    expect(result).toBe(mockUser);
  });
});
