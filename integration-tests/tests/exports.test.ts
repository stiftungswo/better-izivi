import { client, authHeaders } from '../src/client';
import { Session, signInAsAdmin } from '../src/auth';
import {
  createServiceSpecification,
  createService,
  registerCivilServant,
  registerAndSignInCivilServant,
} from '../src/fixtures';

describe('PDF export endpoints', () => {
  let admin: Session;
  let civilServant: Session;
  let serviceId: number;

  beforeAll(async () => {
    admin = await signInAsAdmin();
    civilServant = await registerAndSignInCivilServant();
    const serviceSpecificationId = await createServiceSpecification(admin.token);
    const user = await registerCivilServant();
    const service = await createService(admin.token, user.id, serviceSpecificationId, 600);
    serviceId = service.id;
  });

  describe('GET /v1/phone_list.pdf', () => {
    it('is admin-only', async () => {
      const response = await client.get('/v1/phone_list.pdf', {
        params: { token: civilServant.token, phone_list: { beginning: '2030-01-01', ending: '2030-03-01' } },
      });

      expect(response.status).toBe(401);
    });

    it('renders a pdf for an admin token', async () => {
      const response = await client.get('/v1/phone_list.pdf', {
        params: { token: admin.token, phone_list: { beginning: '2030-01-01', ending: '2030-03-01' } },
        responseType: 'arraybuffer',
      });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('pdf');
    });

    it('rejects a missing token', async () => {
      const response = await client.get('/v1/phone_list.pdf', {
        params: { phone_list: { beginning: '2030-01-01', ending: '2030-03-01' } },
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /v1/payments_list.pdf', () => {
    it('renders a pdf of pending payments for an admin token', async () => {
      const response = await client.get('/v1/payments_list.pdf', {
        params: { token: admin.token, payment: 'pending' },
        responseType: 'arraybuffer',
      });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('pdf');
    });

    it('is admin-only', async () => {
      const response = await client.get('/v1/payments_list.pdf', {
        params: { token: civilServant.token, payment: 'pending' },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /v1/expenses_overview.pdf', () => {
    it('renders a pdf for an admin token', async () => {
      const response = await client.get('/v1/expenses_overview.pdf', {
        params: { token: admin.token, expenses_overview: { beginning: '2030-01-01', ending: '2030-03-01' } },
        responseType: 'arraybuffer',
      });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('pdf');
    });

    it('is admin-only', async () => {
      const response = await client.get('/v1/expenses_overview.pdf', {
        params: {
          token: civilServant.token,
          expenses_overview: { beginning: '2030-01-01', ending: '2030-03-01' },
        },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /v1/export_certificate/:id', () => {
    it('is unauthenticated-rejected', async () => {
      const response = await client.get(`/v1/export_certificate/${serviceId}`);

      expect(response.status).toBe(401);
    });

    it('is admin-only', async () => {
      const response = await client.get(`/v1/export_certificate/${serviceId}`, {
        headers: authHeaders(civilServant.token),
      });

      expect(response.status).toBe(401);
    });

    it('does not error for an admin requesting an existing service', async () => {
      const response = await client.get(`/v1/export_certificate/${serviceId}`, {
        headers: authHeaders(admin.token),
      });

      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(404);
    });

    it('renders a 404 for a non-existent service', async () => {
      const response = await client.get('/v1/export_certificate/-1', { headers: authHeaders(admin.token) });

      expect(response.status).toBe(404);
    });
  });
});
