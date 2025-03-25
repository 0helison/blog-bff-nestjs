import { Inject, Injectable } from '@nestjs/common';
import { Http } from 'src/utils/http/http.service';
import { UsersType } from '../../utils/types/users-type';

@Injectable()
export class UsersService {
  constructor(@Inject('HttpUsers') private readonly http: Http) {}

  async getUser(id: number): Promise<UsersType> {
    const response = await this.http.sendRequest<UsersType>(
      {
        method: 'GET',
        path: `/users/${id}`,
      },
      { timeout: 2500 },
    );

    return response;
  }
}
