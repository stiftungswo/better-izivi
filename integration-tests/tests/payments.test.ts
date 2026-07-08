import { client, authHeaders } from '../src/client';
import { Session, signInAsAdmin } from '../src/auth';
import {
  createConfirmedService,
  createServiceSpecification,
  registerCivilServant,
  registerAndSignInCivilServant,
} from '../src/fixtures';

describe('V1::PaymentsController', () => {
  let admin: Session;
  let civilServant: Session;
  let serviceSpecificationId: number;
  let weeksFromNow = 560;

  // Payment#payment_timestamp is floored to the whole second
  // (Payment.floor_time) and there's nothing else to key a payment by, so
  // two `POST /v1/payments` calls landing in the same wall-clock second
  // would collide and get merged into one payment. This suite runs fast
  // enough for that to actually happen, so force a fresh second first.
  async function waitForNextSecond(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000 - (Date.now() % 1000) + 50));
  }

  async function createReadyForPaymentExpenseSheet(): Promise<number> {
    const user = await registerCivilServant();
    await createConfirmedService(admin.token, user.id, serviceSpecificationId, weeksFromNow++);

    const userResponse = await client.get(`/v1/users/${user.id}`, { headers: authHeaders(admin.token) });
    const expenseSheetId = userResponse.data.expense_sheets[0].id;

    await client.put(
      `/v1/expense_sheets/${expenseSheetId}`,
      { expense_sheet: { state: 'ready_for_payment', work_days: 1 } },
      { headers: authHeaders(admin.token) }
    );

    return expenseSheetId;
  }

  beforeAll(async () => {
    admin = await signInAsAdmin();
    civilServant = await registerAndSignInCivilServant();
    serviceSpecificationId = await createServiceSpecification(admin.token);
  });

  it('rejects a civil servant from the payments index', async () => {
    const response = await client.get('/v1/payments', { headers: authHeaders(civilServant.token) });

    expect(response.status).toBe(401);
  });

  it('lets an admin list payments', async () => {
    const response = await client.get('/v1/payments', { headers: authHeaders(admin.token) });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('takes a ready_for_payment expense sheet through create -> confirm', async () => {
    await waitForNextSecond();
    await createReadyForPaymentExpenseSheet();

    const createPaymentResponse = await client.post('/v1/payments', {}, { headers: authHeaders(admin.token) });
    // NB: PaymentsController#create passes `state: :created` (not `status:`) to
    // `render`, so Rails silently ignores it and responds 200 rather than 201.
    // Captured here as the current contract, not asserting it's correct.
    expect(createPaymentResponse.status).toBe(200);
    expect(createPaymentResponse.data.state).toBe('payment_in_progress');
    const paymentTimestamp = createPaymentResponse.data.payment_timestamp;

    const confirmResponse = await client.put(
      `/v1/payments/${paymentTimestamp}/confirm`,
      {},
      { headers: authHeaders(admin.token) }
    );
    expect(confirmResponse.status).toBe(200);
    expect(confirmResponse.data.state).toBe('paid');
  });

  it('shows a payment as json, and exports the pain XML via a token', async () => {
    await waitForNextSecond();
    await createReadyForPaymentExpenseSheet();
    const createPaymentResponse = await client.post('/v1/payments', {}, { headers: authHeaders(admin.token) });
    const paymentTimestamp = createPaymentResponse.data.payment_timestamp;

    const showResponse = await client.get(`/v1/payments/${paymentTimestamp}`, { headers: authHeaders(admin.token) });
    expect(showResponse.status).toBe(200);
    expect(showResponse.data).toEqual(
      expect.objectContaining({ payment_timestamp: paymentTimestamp, state: 'payment_in_progress' })
    );

    const xmlResponse = await client.get(`/v1/payments/${paymentTimestamp}.xml`, {
      params: { token: admin.token },
      responseType: 'arraybuffer',
    });
    expect(xmlResponse.status).toBe(200);
    expect(xmlResponse.headers['content-type']).toContain('xml');
  });

  it('cancels a payment back to ready_for_payment', async () => {
    await waitForNextSecond();
    await createReadyForPaymentExpenseSheet();
    const createPaymentResponse = await client.post('/v1/payments', {}, { headers: authHeaders(admin.token) });
    const paymentTimestamp = createPaymentResponse.data.payment_timestamp;

    const cancelResponse = await client.delete(`/v1/payments/${paymentTimestamp}`, {
      headers: authHeaders(admin.token),
    });
    expect(cancelResponse.status).toBe(200);
    expect(cancelResponse.data.state).toBe('ready_for_payment');

    const showAfterCancel = await client.get(`/v1/payments/${paymentTimestamp}`, {
      headers: authHeaders(admin.token),
    });
    expect(showAfterCancel.status).toBe(404);
  });
});
