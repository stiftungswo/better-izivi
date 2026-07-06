import { client, authHeaders } from '../src/client';
import { signIn, signInAsAdmin } from '../src/auth';
import { registerCivilServant } from '../src/fixtures';

describe('POST /v1/users/sign_in', () => {
  it('signs in a freshly registered civil servant and returns a bearer token', async () => {
    const user = await registerCivilServant();
    const session = await signIn(user);

    expect(session.token).toEqual(expect.any(String));
    expect(session.token.length).toBeGreaterThan(10);
  });

  it('signs in the bootstrap admin', async () => {
    const session = await signInAsAdmin();

    expect(session.userId).toEqual(expect.any(Number));
  });

  it('rejects an incorrect password', async () => {
    const user = await registerCivilServant();
    const response = await client.post('/v1/users/sign_in', {
      user: { email: user.email, password: 'wrong-password' },
    });

    expect(response.status).toBe(401);
    expect(response.headers['authorization']).toBeUndefined();
  });

  it('rejects an unknown email', async () => {
    const response = await client.post('/v1/users/sign_in', {
      user: { email: 'nobody@example.com', password: 'whatever' },
    });

    expect(response.status).toBe(401);
  });
});

describe('POST /v1/users/validate', () => {
  it('accepts valid, not-yet-taken registration fields', async () => {
    const response = await client.post('/v1/users/validate', {
      user: { email: `validate-${Date.now()}@example.com`, zdp: 222333, community_password: '123456' },
    });

    expect(response.status).toBe(204);
  });

  it('rejects a duplicate email with a structured error', async () => {
    const user = await registerCivilServant();

    const response = await client.post('/v1/users/validate', {
      user: { email: user.email, zdp: 222334, community_password: '123456' },
    });

    expect(response.status).toBe(400);
    expect(response.data).toEqual(
      expect.objectContaining({ errors: expect.any(Object), human_readable_descriptions: expect.any(Array) })
    );
  });

  it('rejects an incorrect community password', async () => {
    const response = await client.post('/v1/users/validate', {
      user: { email: `validate-${Date.now()}@example.com`, zdp: 222335, community_password: 'wrong' },
    });

    expect(response.status).toBe(400);
  });
});

describe('DELETE /v1/users/sign_out', () => {
  it('revokes the token via the JWT allowlist so it can no longer be used', async () => {
    const user = await registerCivilServant();
    const session = await signIn(user);

    const signOutResponse = await client.delete('/v1/users/sign_out', {
      headers: authHeaders(session.token),
    });
    expect(signOutResponse.status).toBe(204);

    const reuseResponse = await client.get(`/v1/users/${session.userId}`, {
      headers: authHeaders(session.token),
    });
    expect(reuseResponse.status).toBe(401);
  });
});

describe('authentication requirement', () => {
  it('rejects unauthenticated access to a protected resource', async () => {
    const response = await client.get('/v1/users/1');

    expect(response.status).toBe(401);
    expect(response.data).toHaveProperty('error');
  });

  it('rejects requests with a garbage bearer token', async () => {
    const response = await client.get('/v1/users/1', {
      headers: authHeaders('not-a-real-token'),
    });

    expect(response.status).toBe(401);
  });
});
