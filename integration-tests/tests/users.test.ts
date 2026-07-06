import { client, authHeaders } from '../src/client';
import { Session, signIn, signInAsAdmin } from '../src/auth';
import { registerCivilServant } from '../src/fixtures';

describe('V1::UsersController', () => {
  let civilServant: Session;
  let civilServantEmail: string;
  let admin: Session;

  beforeAll(async () => {
    const user = await registerCivilServant();
    civilServantEmail = user.email;
    civilServant = await signIn(user);
    admin = await signInAsAdmin();
  });

  describe('#show', () => {
    it('lets a civil servant view themselves, including nested services/expense_sheets', async () => {
      const response = await client.get(`/v1/users/${civilServant.userId}`, {
        headers: authHeaders(civilServant.token),
      });

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        id: civilServant.userId,
        email: civilServantEmail,
        role: 'civil_servant',
      });
      expect(Array.isArray(response.data.services)).toBe(true);
      expect(Array.isArray(response.data.expense_sheets)).toBe(true);
    });

    it('forbids a civil servant from viewing another user', async () => {
      const response = await client.get(`/v1/users/${admin.userId}`, {
        headers: authHeaders(civilServant.token),
      });

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('lets an admin view any user', async () => {
      const response = await client.get(`/v1/users/${civilServant.userId}`, {
        headers: authHeaders(admin.token),
      });

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(civilServant.userId);
    });

    it('renders a 404 for a non-existent user', async () => {
      const response = await client.get('/v1/users/-1', { headers: authHeaders(admin.token) });

      expect(response.status).toBe(404);
    });
  });

  describe('#index', () => {
    it('is admin-only', async () => {
      const response = await client.get('/v1/users', { headers: authHeaders(civilServant.token) });

      expect(response.status).toBe(401);
    });

    it('lists users for an admin', async () => {
      const response = await client.get('/v1/users', { headers: authHeaders(admin.token) });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(2);
      expect(response.data[0]).toEqual(
        expect.objectContaining({ id: expect.any(Number), zdp: expect.any(Number), role: expect.any(String) })
      );
    });
  });

  describe('#destroy', () => {
    it('is admin-only', async () => {
      const victim = await registerCivilServant();
      const response = await client.delete(`/v1/users/${victim.id}`, { headers: authHeaders(civilServant.token) });

      expect(response.status).toBe(401);
    });

    it('lets an admin delete a user with no services', async () => {
      const victim = await registerCivilServant();
      const response = await client.delete(`/v1/users/${victim.id}`, { headers: authHeaders(admin.token) });

      expect(response.status).toBe(204);
    });

    it('forbids an admin from deleting themselves', async () => {
      const response = await client.delete(`/v1/users/${admin.userId}`, { headers: authHeaders(admin.token) });

      expect(response.status).toBe(400);
      expect(response.data).toEqual(
        expect.objectContaining({
          errors: expect.any(Object),
          human_readable_descriptions: expect.any(Array),
        })
      );
    });
  });

  describe('#update validation', () => {
    it('renders a structured 400 for invalid data', async () => {
      const response = await client.put(
        `/v1/users/${civilServant.userId}`,
        { user: { zip: 'not-a-number' } },
        { headers: authHeaders(civilServant.token) }
      );

      expect(response.status).toBe(400);
      expect(response.data).toEqual(
        expect.objectContaining({
          errors: expect.any(Object),
          human_readable_descriptions: expect.any(Array),
        })
      );
    });
  });
});
