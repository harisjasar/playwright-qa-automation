import { z } from 'zod';

export const PostSchema = z.strictObject({
  userId: z.number().int().positive(),
  id: z.number().int().positive(),
  title: z.string().min(1),
  body: z.string().min(1),
});

export const NewPostSchema = PostSchema.omit({ id: true });

export type Post = z.infer<typeof PostSchema>;
export type NewPost = z.infer<typeof NewPostSchema>;
