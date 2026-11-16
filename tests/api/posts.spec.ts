import { expect, test } from '../../src/fixtures';
import { PostSchema } from '../../src/api/schemas/post';
import { buildPost } from '../../src/data/factories';

test.describe('posts', () => {
  test('create a post, then read it back', async ({ postsClient }) => {
    test.info().annotations.push({
      type: 'fake backend',
      description:
        'jsonplaceholder accepts POST /posts and returns id 101, but stores nothing, so GET ' +
        '/posts/101 returns 404. The test asserts what the fake guarantees: the create ' +
        'contract, and the documented 404 on read-back. Against a real backend the last ' +
        'step would expect 200 and a body equal to the created post.',
    });

    const payload = buildPost();

    const created = await test.step('POST /posts creates the post', async () => {
      const response = await postsClient.create(payload);
      expect(response.status).toBe(201);
      expect(response.body).toMatchSchema(PostSchema);
      const post = response.data();
      expect(post).toEqual({ ...payload, id: post.id });
      return post;
    });

    await test.step('GET the created post: the fake did not persist it', async () => {
      const response = await postsClient.getById(created.id);
      expect(
        response.status,
        'jsonplaceholder does not persist writes. If this starts returning 200, the service ' +
          'changed: switch this step to a full read-back comparison.',
      ).toBe(404);
    });
  });

  test('an existing post matches the post schema', async ({ postsClient }) => {
    const response = await postsClient.getById(1);

    expect(response.status).toBe(200);
    expect(response.body).toMatchSchema(PostSchema);
  });
});
