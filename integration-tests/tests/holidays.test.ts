import { client, authHeaders } from '../src/client';
import { Session } from '../src/auth';
import { registerAndSignInCivilServant } from '../src/fixtures';

// NOTE: HolidaysController has no admin restriction — any authenticated user
// (civil servant or admin) can create/update/destroy holidays. That's
// existing behavior, captured here as the contract, not something this
// suite is asserting *should* be true.
describe('V1::HolidaysController', () => {
  let civilServant: Session;

  beforeAll(async () => {
    civilServant = await registerAndSignInCivilServant();
  });

  it('rejects unauthenticated access', async () => {
    const response = await client.get('/v1/holidays');

    expect(response.status).toBe(401);
  });

  it('supports create, list, update and destroy for an authenticated civil servant', async () => {
    const headers = authHeaders(civilServant.token);

    const createResponse = await client.post(
      '/v1/holidays',
      {
        holiday: {
          beginning: '2031-01-01',
          ending: '2031-01-01',
          holiday_type: 'public_holiday',
          description: 'integration-test-holiday',
        },
      },
      { headers }
    );
    expect(createResponse.status).toBe(201);
    const holidayId = createResponse.data.id;

    const indexResponse = await client.get('/v1/holidays', { headers });
    expect(indexResponse.status).toBe(200);
    expect(indexResponse.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: holidayId, description: 'integration-test-holiday' })])
    );

    const updateResponse = await client.put(
      `/v1/holidays/${holidayId}`,
      { holiday: { description: 'updated-by-integration-test' } },
      { headers }
    );
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.description).toBe('updated-by-integration-test');

    const destroyResponse = await client.delete(`/v1/holidays/${holidayId}`, { headers });
    expect(destroyResponse.status).toBe(204);
  });

  it('rejects an invalid holiday_type with a structured validation error', async () => {
    const response = await client.post(
      '/v1/holidays',
      {
        holiday: {
          beginning: '2031-02-01',
          ending: '2031-02-01',
          holiday_type: 'not-a-real-type',
          description: 'invalid',
        },
      },
      { headers: authHeaders(civilServant.token) }
    );

    expect(response.status).toBe(400);
  });
});
