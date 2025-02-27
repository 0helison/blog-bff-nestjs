import { Inject, Injectable } from '@nestjs/common';
import { Http } from 'src/utils/http/http.service';
import { UsersResponseType } from './types/users-renponse-type';
import { UsersType } from './types/users-type';

@Injectable()
export class UsersService {
  constructor(@Inject('HttpUsers') private readonly http: Http) {}

  async getUsers(ids: number[]): Promise<UsersResponseType> {
    const response = (await this.http.request<UsersType[]>(
      {
        method: 'GET',
        path: '/users',
        query: { id: ids },
      },
      { timeout: 5000 },
    )) as UsersType[];

    return Object.fromEntries(response.map(({ id, name }) => [id, name]));
  }
}
