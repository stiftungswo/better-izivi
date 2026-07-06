import { client, authHeaders } from '../src/client';
import { signIn } from '../src/auth';
import { registerCivilServant } from '../src/fixtures';

// These hit devise's own registrations#update / #destroy (PATCH/PUT and
// DELETE on the bare /v1/users collection route) — a separate code path
// from V1::UsersController's admin-facing /v1/users/:id, which is covered
// in users.test.ts.
describe('Devise self-service profile (PATCH/DELETE /v1/users)', () => {
  it('requires current_password to change your own profile', async () => {
    const user = await registerCivilServant();
    const session = await signIn(user);

    const withoutPassword = await client.put(
      '/v1/users',
      { user: { first_name: 'Changed' } },
      { headers: authHeaders(session.token) }
    );
    // NB: this is devise's own registrations#update, not our ValidationError
    // pipeline (which uses 400) — devise renders its own errors as 422.
    expect(withoutPassword.status).toBe(422);

    const withPassword = await client.put(
      '/v1/users',
      { user: { first_name: 'Changed', current_password: user.password } },
      { headers: authHeaders(session.token) }
    );
    expect(withPassword.status).toBe(204);
  });

  it('rejects an unauthenticated profile update', async () => {
    const response = await client.put('/v1/users', { user: { first_name: 'Nope' } });

    expect(response.status).toBe(401);
  });

  it('lets a user delete their own account (with no services)', async () => {
    const user = await registerCivilServant();
    const session = await signIn(user);

    const response = await client.delete('/v1/users', { headers: authHeaders(session.token) });
    expect(response.status).toBe(204);

    const loginAfterDelete = await client.post('/v1/users/sign_in', { user });
    expect(loginAfterDelete.status).toBe(401);
  });
});
