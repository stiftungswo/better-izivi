import { client, authHeaders } from '../src/client';
import { Session, signInAsAdmin } from '../src/auth';
import { createServiceSpecification, registerAndSignInCivilServant } from '../src/fixtures';

const dayExpenses = { breakfast: 0, lunch: 0, dinner: 0 };

describe('V1::ServiceSpecificationsController', () => {
  let civilServant: Session;
  let admin: Session;
  let seedSpecId: number;

  beforeAll(async () => {
    civilServant = await registerAndSignInCivilServant();
    admin = await signInAsAdmin();
    seedSpecId = await createServiceSpecification(admin.token);
  });

  it('lists specifications for any authenticated user', async () => {
    const response = await client.get('/v1/service_specifications', {
      headers: authHeaders(civilServant.token),
    });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: seedSpecId, pocket_money: expect.any(Number) })])
    );
  });

  it('shows a single specification', async () => {
    const response = await client.get(`/v1/service_specifications/${seedSpecId}`, {
      headers: authHeaders(civilServant.token),
    });

    expect(response.status).toBe(200);
    expect(response.data.id).toBe(seedSpecId);
  });

  it('forbids a civil servant from creating a specification', async () => {
    const response = await client.post(
      '/v1/service_specifications',
      {
        service_specification: {
          name: 'Should Not Be Created',
          short_name: 'X',
          identification_number: '00000',
          work_clothing_expenses: 0,
          accommodation_expenses: 0,
          location: 'zurich',
          active: true,
          work_days_expenses: dayExpenses,
          paid_vacation_expenses: dayExpenses,
          first_day_expenses: dayExpenses,
          last_day_expenses: dayExpenses,
        },
      },
      { headers: authHeaders(civilServant.token) }
    );

    expect(response.status).toBe(401);
  });

  it('lets an admin create and then update a specification', async () => {
    const suffix = Date.now();
    const createResponse = await client.post(
      '/v1/service_specifications',
      {
        service_specification: {
          name: `Integration Test Spec ${suffix}`,
          short_name: 'IT',
          identification_number: `${suffix}`.slice(-5),
          work_clothing_expenses: 0,
          accommodation_expenses: 0,
          location: 'zurich',
          active: true,
          work_days_expenses: dayExpenses,
          paid_vacation_expenses: dayExpenses,
          first_day_expenses: dayExpenses,
          last_day_expenses: dayExpenses,
        },
      },
      { headers: authHeaders(admin.token) }
    );

    expect(createResponse.status).toBe(201);
    const specId = createResponse.data.id;

    const updateResponse = await client.put(
      `/v1/service_specifications/${specId}`,
      { service_specification: { active: false } },
      { headers: authHeaders(admin.token) }
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.active).toBe(false);
  });
});
