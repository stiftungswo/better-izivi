import { client, authHeaders } from '../src/client';
import { Session, signInAsAdmin } from '../src/auth';
import {
  createConfirmedService,
  createServiceSpecification,
  registerCivilServant,
  registerAndSignInCivilServant,
} from '../src/fixtures';

describe('V1::ExpenseSheetsController', () => {
  let admin: Session;
  let civilServant: Session;
  let serviceSpecificationId: number;
  let weeksFromNow = 540;

  async function freshExpenseSheets() {
    const user = await registerCivilServant();
    const service = await createConfirmedService(admin.token, user.id, serviceSpecificationId, weeksFromNow++);
    const userResponse = await client.get(`/v1/users/${user.id}`, { headers: authHeaders(admin.token) });
    return {
      serviceId: service.id,
      expenseSheets: userResponse.data.expense_sheets as { id: number }[],
    };
  }

  beforeAll(async () => {
    admin = await signInAsAdmin();
    civilServant = await registerAndSignInCivilServant();
    serviceSpecificationId = await createServiceSpecification(admin.token);
  });

  it('generates expense sheets when a service is confirmed, and exposes hints/update/pdf for them', async () => {
    const { expenseSheets } = await freshExpenseSheets();
    expect(expenseSheets.length).toBeGreaterThan(0);
    const expenseSheetId = expenseSheets[0].id;

    const hintsResponse = await client.get(`/v1/expense_sheets/${expenseSheetId}/hints`, {
      headers: authHeaders(admin.token),
    });
    expect(hintsResponse.status).toBe(200);
    expect(hintsResponse.data).toEqual(
      expect.objectContaining({ suggestions: expect.any(Object), remaining_days: expect.any(Object) })
    );

    const updateResponse = await client.put(
      `/v1/expense_sheets/${expenseSheetId}`,
      { expense_sheet: { work_days: 1 } },
      { headers: authHeaders(admin.token) }
    );
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.work_days).toBe(1);

    const pdfResponse = await client.get(`/v1/expense_sheets/${expenseSheetId}.pdf`, {
      params: { token: admin.token },
    });
    expect(pdfResponse.status).toBe(200);
    expect(pdfResponse.headers['content-type']).toContain('pdf');
  });

  it('rejects expense sheet update from a non-admin', async () => {
    const { expenseSheets } = await freshExpenseSheets();

    const response = await client.put(
      `/v1/expense_sheets/${expenseSheets[0].id}`,
      { expense_sheet: { work_days: 1 } },
      { headers: authHeaders(civilServant.token) }
    );

    expect(response.status).toBe(401);
  });

  it('rejects the pdf export without a valid token', async () => {
    const { expenseSheets } = await freshExpenseSheets();

    const response = await client.get(`/v1/expense_sheets/${expenseSheets[0].id}.pdf`, {
      params: { token: 'not-a-real-token' },
    });

    expect(response.status).toBe(401);
  });

  it('validates a not-yet-saved edit via live_hints', async () => {
    const { expenseSheets } = await freshExpenseSheets();

    const response = await client.post(
      `/v1/expense_sheets/${expenseSheets[0].id}/live_hints`,
      { expense_sheet: { work_days: 1 } },
      { headers: authHeaders(admin.token) }
    );

    expect(response.status).toBe(200);
    expect(response.data).toEqual(
      expect.objectContaining({ suggestions: expect.any(Object), remaining_days: expect.any(Object) })
    );
  });

  it('lets an admin destroy an expense sheet', async () => {
    const { expenseSheets } = await freshExpenseSheets();

    const response = await client.delete(`/v1/expense_sheets/${expenseSheets[0].id}`, {
      headers: authHeaders(admin.token),
    });

    expect(response.status).toBe(204);
  });

  it('shows a single expense sheet as json', async () => {
    const { expenseSheets } = await freshExpenseSheets();

    const response = await client.get(`/v1/expense_sheets/${expenseSheets[0].id}`, {
      headers: authHeaders(admin.token),
    });

    expect(response.status).toBe(200);
    expect(response.data.id).toBe(expenseSheets[0].id);
  });

  it('adds an additional expense sheet to a service', async () => {
    const { serviceId } = await freshExpenseSheets();

    const response = await client.post(
      '/v1/expense_sheets',
      {},
      { params: { service_id: serviceId }, headers: authHeaders(admin.token) }
    );

    expect(response.status).toBe(200);
    expect(response.data.service_id).toBe(serviceId);
  });

  it('computes a total sum across expense sheets', async () => {
    const response = await client.get('/v1/expenses_sheet_sum', { headers: authHeaders(admin.token) });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('is admin-only for the index', async () => {
    const response = await client.get('/v1/expense_sheets', { headers: authHeaders(civilServant.token) });

    expect(response.status).toBe(401);
  });
});
