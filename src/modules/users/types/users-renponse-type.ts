import { UsersType } from './users-type';

export type UsersResponseType = Record<UsersType['id'], UsersType['name']>;
