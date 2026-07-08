import { client, authHeaders } from '../src/client';
import { signInAsAdmin, Session } from '../src/auth';
import { createConfirmedService, createServiceSpecification, registerCivilServant } from '../src/fixtures';
import { DimeMock, MOCK_DIME_EMPLOYEE_ID, MOCK_DIME_TOKEN, startDimeMock } from '../src/dimeMock';
import {
  getApiContainerGatewayIp,
  installCaCertInApiContainer,
  recreateApiContainer,
  waitForApiReady,
} from '../src/dockerDime';

// GET /v1/expenses_sheet_sick_days_dime calls out to an external DIME
// service (AuthenticateInDime), unconditionally — CONNECT_TO_DIME only
// gates the *other* DIME integration point (registration). To test this
// for real (not just assert it 500s against the real, unreachable-from-here
// DIME staging host) this spins up a local HTTPS mock standing in for DIME,
// and recreates the `api` container pointed at it via API_URI_DIME. That
// container is shared with every other test file in this suite, so setup
// and teardown here are deliberately conservative: recreate, verify ready,
// and always restore afterwards, even on failure.
describe('GET /v1/expenses_sheet_sick_days_dime (against a mocked DIME backend)', () => {
  let mock: DimeMock;
  let admin: Session;
  let serviceSpecificationId: number;

  beforeAll(async () => {
    const hostIp = getApiContainerGatewayIp();
    mock = await startDimeMock(hostIp);
    recreateApiContainer(`https://${hostIp}:${mock.port}`);
    await waitForApiReady();
    installCaCertInApiContainer(mock.certPem);

    admin = await signInAsAdmin();
    serviceSpecificationId = await createServiceSpecification(admin.token);
  }, 120000);

  afterAll(async () => {
    try {
      await mock.stop();
    } finally {
      recreateApiContainer();
      await waitForApiReady();
    }
  }, 120000);

  it("forwards the expense sheet's user and date range to DIME, and returns the sick day count DIME reports", async () => {
    mock.setProjectEffortsCount(3);

    const user = await registerCivilServant();
    await createConfirmedService(admin.token, user.id, serviceSpecificationId, 900);
    const userResponse = await client.get(`/v1/users/${user.id}`, { headers: authHeaders(admin.token) });
    const expenseSheet = userResponse.data.expense_sheets[0];

    const response = await client.get('/v1/expenses_sheet_sick_days_dime', {
      params: { id: expenseSheet.id },
      headers: authHeaders(admin.token),
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ sick_days: 3 });

    const requests = mock.requests();
    expect(requests).toEqual(
      expect.arrayContaining([expect.objectContaining({ method: 'POST', url: '/v2/employees/sign_in' })])
    );

    const searchRequest = requests.find((r) => r.method === 'GET' && r.url.startsWith('/v2/employees?'));
    expect(searchRequest).toBeDefined();
    expect(decodeURIComponent(searchRequest!.url)).toContain(`filterSearch=${user.email}`);
    expect(searchRequest!.headers.authorization).toBe(MOCK_DIME_TOKEN);

    const effortsRequest = requests.find((r) => r.method === 'GET' && r.url.startsWith('/v2/project_efforts?'));
    expect(effortsRequest).toBeDefined();
    expect(effortsRequest!.url).toContain(`start=${expenseSheet.beginning}`);
    expect(effortsRequest!.url).toContain(`end=${expenseSheet.ending}`);
    expect(effortsRequest!.url).toContain(`employee_ids=${MOCK_DIME_EMPLOYEE_ID}`);
  });

  it('returns -1 when DIME has no matching employee', async () => {
    mock.setEmployeeFound(false);

    const user = await registerCivilServant();
    await createConfirmedService(admin.token, user.id, serviceSpecificationId, 903);
    const userResponse = await client.get(`/v1/users/${user.id}`, { headers: authHeaders(admin.token) });
    const expenseSheet = userResponse.data.expense_sheets[0];

    const response = await client.get('/v1/expenses_sheet_sick_days_dime', {
      params: { id: expenseSheet.id },
      headers: authHeaders(admin.token),
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ sick_days: -1 });

    mock.setEmployeeFound(true);
  });

  it('reflects a different DIME sick-day count for a different expense sheet', async () => {
    mock.setProjectEffortsCount(0);

    const user = await registerCivilServant();
    await createConfirmedService(admin.token, user.id, serviceSpecificationId, 905);
    const userResponse = await client.get(`/v1/users/${user.id}`, { headers: authHeaders(admin.token) });
    const expenseSheet = userResponse.data.expense_sheets[0];

    const response = await client.get('/v1/expenses_sheet_sick_days_dime', {
      params: { id: expenseSheet.id },
      headers: authHeaders(admin.token),
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ sick_days: 0 });
  });
});
