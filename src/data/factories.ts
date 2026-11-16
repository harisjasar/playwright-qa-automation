import { randomUUID } from 'node:crypto';
import type { NewPost } from '../api/schemas/post';

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export function buildCustomer(overrides: Partial<Customer> = {}): Customer {
  return { firstName: 'Ada', lastName: 'Lovelace', postalCode: '10115', ...overrides };
}

/** Unique title so a post can be traced back to the test run that created it. */
export function buildPost(overrides: Partial<NewPost> = {}): NewPost {
  return {
    userId: 1,
    title: `qa-test-${randomUUID()}`,
    body: 'Created by the automated API suite.',
    ...overrides,
  };
}
