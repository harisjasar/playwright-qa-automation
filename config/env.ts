import path from 'node:path';
import dotenv from 'dotenv';

// Values come from .env locally and from real environment variables in CI.
// Already-set environment variables win over .env.
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env and fill it in (see README).`,
    );
  }
  if (/^\{\{.*\}\}$/.test(value)) {
    throw new Error(
      `Environment variable ${name} still holds the template placeholder ${value}. ` +
        'Replace it with the real value (see README, "Configuration and credentials").',
    );
  }
  return value;
}

export const env = {
  sauce: {
    baseUrl: required('SAUCE_BASE_URL'),
    password: required('SAUCE_PASSWORD'),
    users: {
      standard: required('SAUCE_STANDARD_USER'),
      problem: required('SAUCE_PROBLEM_USER'),
    },
  },
  api: {
    baseUrl: required('API_BASE_URL'),
  },
} as const;

export type SauceUser = keyof typeof env.sauce.users;

/** Where the setup project stores the logged-in browser state for each user. */
export function authFile(user: SauceUser): string {
  return path.resolve(__dirname, '..', '.auth', `${user}.json`);
}
