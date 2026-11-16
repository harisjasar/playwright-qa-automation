import { ApiClient, type ApiResult } from './ApiClient';
import { UserSchema, type User } from './schemas/user';

export class UsersClient extends ApiClient {
  getById(id: number): Promise<ApiResult<User>> {
    return this.get(`/users/${id}`, UserSchema);
  }
}
