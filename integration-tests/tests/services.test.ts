import { client, authHeaders } from '../src/client';
import { Session, signInAsAdmin } from '../src/auth';
import {
  createService,
  createServiceSpecification,
  registerCivilServant,
  registerAndSignInCivilServant,
} from '../src/fixtures';
import { normalServiceRange } from '../src/dates';

describe('V1::ServicesController', () => {
  let admin: Session;
  let civilServant: Session;
  let serviceSpecificationId: number;

  beforeAll(async () => {
    admin = await signInAsAdmin();
    civilServant = await registerAndSignInCivilServant();
    serviceSpecificationId = await createServiceSpecification(admin.token);
  });

  it('calculates chargeable service days for a date range', async () => {
    const { beginning, ending } = normalServiceRange(500);

    const response = await client.get('/v1/services/calculate_service_days', {
      params: { beginning, ending },
      headers: authHeaders(admin.token),
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ result: expect.any(Number) });
  });

  it('lets an admin create, confirm and cancel-by-overlap a service for a fresh user', async () => {
    const user = await registerCivilServant();
    const { beginning, ending } = normalServiceRange(520);

    const calculated = await client.get('/v1/services/calculate_service_days', {
      params: { beginning, ending },
      headers: authHeaders(admin.token),
    });
    const serviceDays = calculated.data.result;

    const createResponse = await client.post(
      '/v1/services',
      {
        service: {
          user_id: user.id,
          service_specification_id: serviceSpecificationId,
          beginning,
          ending,
          service_type: 'normal',
          service_days: serviceDays,
          first_swo_service: true,
          long_service: false,
          probation_service: false,
        },
      },
      { headers: authHeaders(admin.token) }
    );

    expect(createResponse.status).toBe(201);
    expect(createResponse.data).toMatchObject({
      user_id: user.id,
      beginning,
      ending,
      confirmation_date: null,
    });
    const serviceId = createResponse.data.id;

    const overlapResponse = await client.post(
      '/v1/services',
      {
        service: {
          user_id: user.id,
          service_specification_id: serviceSpecificationId,
          beginning,
          ending,
          service_type: 'normal',
          service_days: serviceDays,
          first_swo_service: true,
          long_service: false,
          probation_service: false,
        },
      },
      { headers: authHeaders(admin.token) }
    );
    expect(overlapResponse.status).toBe(400);
    expect(overlapResponse.data).toEqual(
      expect.objectContaining({ errors: expect.any(Object), human_readable_descriptions: expect.any(Array) })
    );

    const confirmResponse = await client.put(
      `/v1/services/${serviceId}/confirm`,
      {},
      { headers: authHeaders(admin.token) }
    );
    expect(confirmResponse.status).toBe(200);
    expect(confirmResponse.data.confirmation_date).not.toBeNull();

    const userResponse = await client.get(`/v1/users/${user.id}`, { headers: authHeaders(admin.token) });
    expect(userResponse.data.expense_sheets.length).toBeGreaterThan(0);
  });

  it('lets an admin destroy an unconfirmed service', async () => {
    const user = await registerCivilServant();
    const { beginning, ending } = normalServiceRange(525);
    const calculated = await client.get('/v1/services/calculate_service_days', {
      params: { beginning, ending },
      headers: authHeaders(admin.token),
    });

    const createResponse = await client.post(
      '/v1/services',
      {
        service: {
          user_id: user.id,
          service_specification_id: serviceSpecificationId,
          beginning,
          ending,
          service_type: 'normal',
          service_days: calculated.data.result,
          first_swo_service: true,
          long_service: false,
          probation_service: false,
        },
      },
      { headers: authHeaders(admin.token) }
    );
    expect(createResponse.data.deletable).toBe(true);

    const destroyResponse = await client.delete(`/v1/services/${createResponse.data.id}`, {
      headers: authHeaders(admin.token),
    });
    expect(destroyResponse.status).toBe(204);
  });

  it('calculates an ending date for a given number of service days', async () => {
    const { beginning } = normalServiceRange(530);

    const response = await client.get('/v1/services/calculate_ending', {
      params: { beginning, service_days: 26 },
      headers: authHeaders(admin.token),
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ result: expect.any(String) });
  });

  it('shows a single service as json and pdf, and lets an admin update it', async () => {
    const user = await registerCivilServant();
    const service = await createService(admin.token, user.id, serviceSpecificationId, 535);

    const showResponse = await client.get(`/v1/services/${service.id}`, { headers: authHeaders(admin.token) });
    expect(showResponse.status).toBe(200);
    expect(showResponse.data.id).toBe(service.id);

    const pdfResponse = await client.get(`/v1/services/${service.id}.pdf`, {
      params: { token: admin.token },
    });
    expect(pdfResponse.status).toBe(200);
    expect(pdfResponse.headers['content-type']).toContain('pdf');

    const newEnding = new Date(service.ending);
    newEnding.setDate(newEnding.getDate() + 7);
    const newEndingIso = newEnding.toISOString().slice(0, 10);
    const recalculated = await client.get('/v1/services/calculate_service_days', {
      params: { beginning: service.beginning, ending: newEndingIso },
      headers: authHeaders(admin.token),
    });

    const updateResponse = await client.put(
      `/v1/services/${service.id}`,
      { service: { ending: newEndingIso, service_days: recalculated.data.result } },
      { headers: authHeaders(admin.token) }
    );
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.ending).toBe(newEndingIso);
  });

  it('forbids a civil servant from viewing the services index', async () => {
    const response = await client.get('/v1/services', { headers: authHeaders(civilServant.token) });

    expect(response.status).toBe(401);
  });

  it('lets an admin view the services index', async () => {
    const response = await client.get('/v1/services', { headers: authHeaders(admin.token) });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });
});
