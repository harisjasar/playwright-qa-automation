import { z } from 'zod';

// strictObject: an added or removed field is a contract change and must fail the contract test.
const nonEmpty = z.string().min(1);
const coordinate = z.string().regex(/^-?\d+(\.\d+)?$/, 'expected a decimal coordinate');

export const UserSchema = z.strictObject({
  id: z.number().int().positive(),
  name: nonEmpty,
  username: nonEmpty,
  email: z.email(),
  address: z.strictObject({
    street: nonEmpty,
    suite: nonEmpty,
    city: nonEmpty,
    zipcode: nonEmpty,
    geo: z.strictObject({ lat: coordinate, lng: coordinate }),
  }),
  phone: nonEmpty,
  website: nonEmpty,
  company: z.strictObject({
    name: nonEmpty,
    catchPhrase: nonEmpty,
    bs: nonEmpty,
  }),
});

export type User = z.infer<typeof UserSchema>;
