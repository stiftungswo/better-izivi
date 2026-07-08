import { client } from '../src/client';
import { signIn } from '../src/auth';
import { registerCivilServant } from '../src/fixtures';
import { waitForPasswordResetToken } from '../src/mail';

describe('Devise password reset', () => {
  it('lets a user reset their password via the emailed token, end to end', async () => {
    const user = await registerCivilServant();

    const requestedAt = new Date();
    const requestResponse = await client.post('/v1/users/password', { user: { email: user.email } });
    expect(requestResponse.status).toBe(201);

    const token = await waitForPasswordResetToken(requestedAt);

    const newPassword = 'a-brand-new-password-123';
    const resetResponse = await client.put('/v1/users/password', {
      user: { reset_password_token: token, password: newPassword, password_confirmation: newPassword },
    });
    expect(resetResponse.status).toBe(204);

    const oldPasswordLogin = await client.post('/v1/users/sign_in', {
      user: { email: user.email, password: user.password },
    });
    expect(oldPasswordLogin.status).toBe(401);

    const session = await signIn({ email: user.email, password: newPassword });
    expect(session.userId).toEqual(expect.any(Number));
  });

  it('does not error for an unknown email (no user enumeration signal via status code)', async () => {
    const response = await client.post('/v1/users/password', {
      user: { email: 'no-such-user@example.com' },
    });

    expect(response.status).toBe(201);
  });

  it('rejects an invalid reset token', async () => {
    const response = await client.put('/v1/users/password', {
      user: { reset_password_token: 'not-a-real-token', password: 'whatever123', password_confirmation: 'whatever123' },
    });

    expect(response.status).toBe(422);
  });
});
