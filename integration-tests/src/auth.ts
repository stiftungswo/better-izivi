import { client } from './client';

export interface Credentials {
  email: string;
  password: string;
}

// Must match the ADMIN_EMAIL/ADMIN_PASSWORD constants in globalSetup.js,
// which inserts this user directly via SQL before the suite runs (see that
// file for why: it deliberately does not go through `rails db:seed`).
export const ADMIN_CREDENTIALS: Credentials = {
  email: 'integration-test-admin@example.com',
  password: 'password123',
};

export interface Session {
  token: string;
  userId: number;
}

export async function signIn(credentials: Credentials): Promise<Session> {
  const response = await client.post('/v1/users/sign_in', { user: credentials });

  if (response.status !== 200) {
    throw new Error(
      `Sign in failed for ${credentials.email}: ${response.status} ${JSON.stringify(response.data)}`
    );
  }

  const authHeader = response.headers['authorization'] as string | undefined;
  if (!authHeader) {
    throw new Error('Sign in response did not include an Authorization header');
  }

  return {
    token: authHeader.replace(/^Bearer /, ''),
    userId: response.data.id,
  };
}

export function signInAsAdmin(): Promise<Session> {
  return signIn(ADMIN_CREDENTIALS);
}
