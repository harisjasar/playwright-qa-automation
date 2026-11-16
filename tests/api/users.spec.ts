import { expect, test } from '../../src/fixtures';
import { UserSchema } from '../../src/api/schemas/user';

test.describe('GET /users/{id} contract', { tag: '@contract' }, () => {
  for (const id of [1, 5, 10]) {
    test(`user ${id} matches the user schema`, async ({ usersClient }) => {
      const response = await usersClient.getById(id);

      expect(response.status).toBe(200);
      // One assertion on the whole shape (types, required fields, no extra fields),
      // instead of checking fields one by one.
      expect(response.body).toMatchSchema(UserSchema);
      expect(response.data().id).toBe(id);
    });
  }
});
