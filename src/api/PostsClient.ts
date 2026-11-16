import { ApiClient, type ApiResult } from './ApiClient';
import { PostSchema, type NewPost, type Post } from './schemas/post';

export class PostsClient extends ApiClient {
  getById(id: number): Promise<ApiResult<Post>> {
    return this.get(`/posts/${id}`, PostSchema);
  }

  create(post: NewPost): Promise<ApiResult<Post>> {
    return this.post('/posts', post, PostSchema);
  }
}
