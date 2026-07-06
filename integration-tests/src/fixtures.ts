import { client, authHeaders } from './client';
import { Session, signIn } from './auth';
import { normalServiceRange } from './dates';

// Must match REGIONAL_CENTER_SHORT_NAME in globalSetup.js.
export const BOOTSTRAP_REGIONAL_CENTER_SHORT_NAME = 'IT-Bootstrap';

let cachedRegionalCenterId: number | undefined;

/**
 * Returns the id of the regional center globalSetup.js inserted via SQL.
 * Falls back to whatever the index returns first if it's somehow missing,
 * so this still works if the suite is ever pointed at a database that also
 * has `rails db:seed`'s regional centers loaded.
 */
export async function firstRegionalCenterId(): Promise<number> {
  if (cachedRegionalCenterId !== undefined) {
    return cachedRegionalCenterId;
  }

  const response = await client.get('/v1/regional_centers');
  if (response.status !== 200 || !Array.isArray(response.data) || response.data.length === 0) {
    throw new Error(
      `Expected at least one regional center (globalSetup.js should have created one), got ${response.status} ${JSON.stringify(response.data)}`
    );
  }

  const bootstrapped = response.data.find(
    (center: { short_name: string }) => center.short_name === BOOTSTRAP_REGIONAL_CENTER_SHORT_NAME
  );
  cachedRegionalCenterId = (bootstrapped ?? response.data[0]).id;
  return cachedRegionalCenterId as number;
}

export interface RegisteredUser {
  email: string;
  password: string;
  id: number;
}

function uniqueSuffix(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

/**
 * Registers a brand new civil servant through the public self-registration
 * endpoint, so tests that mutate a user's services/expense sheets don't
 * disturb the shared seeded fixtures other tests rely on.
 */
export async function registerCivilServant(
  overrides: Record<string, unknown> = {}
): Promise<RegisteredUser> {
  const suffix = uniqueSuffix();
  const email = `integration-test-${suffix}@example.com`;
  const password = 'password123';
  const regionalCenterId = await firstRegionalCenterId();

  const response = await client.post('/v1/users', {
    user: {
      email,
      password,
      password_confirmation: password,
      community_password: process.env.COMMUNITY_PASSWORD ?? '123456',
      first_name: 'Integration',
      last_name: 'Test',
      address: 'Teststrasse 1',
      bank_iban: 'CH9300762011623852957',
      birthday: '2005-01-01',
      city: 'Testcity',
      health_insurance: 'Testversicherung',
      zip: '8000',
      hometown: 'Testhometown',
      phone: '079 000 00 00',
      zdp: 100_000 + (Date.now() % 800_000),
      regional_center_id: regionalCenterId,
      ...overrides,
    },
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `Failed to register test user: ${response.status} ${JSON.stringify(response.data)}`
    );
  }

  return { email, password, id: response.data.id };
}

/** Registers a fresh civil servant and signs them in, in one call. */
export async function registerAndSignInCivilServant(
  overrides: Record<string, unknown> = {}
): Promise<Session> {
  const user = await registerCivilServant(overrides);
  return signIn({ email: user.email, password: user.password });
}

const dayExpenses = { breakfast: 0, lunch: 0, dinner: 0 };

/**
 * Creates a fresh ServiceSpecification via the admin API. Tests that need a
 * service_specification_id to create a Service should call this rather than
 * assuming a seeded id (e.g. `1`) exists.
 */
export async function createServiceSpecification(adminToken: string): Promise<number> {
  const suffix = uniqueSuffix();

  const response = await client.post(
    '/v1/service_specifications',
    {
      service_specification: {
        name: `Integration Test Spec ${suffix}`,
        short_name: 'IT',
        identification_number: suffix.replace('-', '').slice(-6),
        // NB: keep this non-zero — ExpenseSheetCalculators::SuggestionsCalculator
        // divides by it unconditionally in #calculate_to_pay_days and 500s on 0.
        work_clothing_expenses: 230,
        accommodation_expenses: 0,
        location: 'zurich',
        active: true,
        work_days_expenses: dayExpenses,
        paid_vacation_expenses: dayExpenses,
        first_day_expenses: dayExpenses,
        last_day_expenses: dayExpenses,
      },
    },
    { headers: authHeaders(adminToken) }
  );

  if (response.status !== 201) {
    throw new Error(
      `Failed to create test service specification: ${response.status} ${JSON.stringify(response.data)}`
    );
  }

  return response.data.id;
}

export interface CreatedService {
  id: number;
  beginning: string;
  ending: string;
}

/**
 * Creates (as admin) a valid "normal" service for `userId`, computing
 * service_days the same way the frontend does: call calculate_service_days
 * first, then pass the result into the create call.
 */
export async function createService(
  adminToken: string,
  userId: number,
  serviceSpecificationId: number,
  weeksFromNow: number
): Promise<CreatedService> {
  const { beginning, ending } = normalServiceRange(weeksFromNow);

  const calculated = await client.get('/v1/services/calculate_service_days', {
    params: { beginning, ending },
    headers: authHeaders(adminToken),
  });

  const response = await client.post(
    '/v1/services',
    {
      service: {
        user_id: userId,
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
    { headers: authHeaders(adminToken) }
  );

  if (response.status !== 201) {
    throw new Error(`Failed to create test service: ${response.status} ${JSON.stringify(response.data)}`);
  }

  return response.data;
}

/** Creates a service via createService() and immediately confirms it (generating expense sheets). */
export async function createConfirmedService(
  adminToken: string,
  userId: number,
  serviceSpecificationId: number,
  weeksFromNow: number
): Promise<CreatedService> {
  const service = await createService(adminToken, userId, serviceSpecificationId, weeksFromNow);
  await client.put(`/v1/services/${service.id}/confirm`, {}, { headers: authHeaders(adminToken) });
  return service;
}
