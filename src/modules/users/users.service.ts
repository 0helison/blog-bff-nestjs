import { Injectable } from '@nestjs/common';
import { Client } from 'undici';

type Users = {
  id: number;
  name: string;
};

@Injectable()
export class UsersService {
  private client: Client;
  constructor() {
    this.client = new Client('http://localhost:3003');
  }

  async getUsers(ids: number[]) {
    const { body } = await this.client.request({
      method: 'GET',
      path: '/users',
      query: { id: ids },
    });

    const data: Users[] = (await body.json()) as Users[];

    const users = new Map<number, string>();

    for (const user of data) {
      users.set(user.id, user.name);
    }

    return Object.fromEntries(users);
  }
}
