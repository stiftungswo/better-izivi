import createMemoryHistory from 'history/createMemoryHistory';
import { Provider } from 'mobx-react';
import moment from 'moment';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createIntl, createIntlCache, RawIntlProvider } from 'react-intl';
import { ThemeProvider } from 'react-jss';
import { Router } from 'react-router';
import { theme } from '../../layout/theme';
import { defaultLocale, messages } from '../../stores/mainStore';
import { ServiceCollection, ServiceSpecification } from '../../types';
import { ServiceOverview } from './ServiceOverview';

/*
 * Integration-level regression test for ticket MAN541 / PR #600: mounts the real
 * ServiceOverview component (not just the extracted weekCalculations.ts helpers) with
 * lightweight mock stores, and confirms that a service spanning a full 53-week ISO year
 * (2026) actually renders all 53 weeks - the end-to-end behavior CodeRabbit's outside-diff
 * finding claimed could still break (a claim we verified and rejected separately in
 * getNrWeeksOrdering.test.tsx, but this confirms the real component's rendered output too).
 */

const intl = createIntl({ locale: defaultLocale, messages: messages[defaultLocale] }, createIntlCache());

const cookieYearKey = 'service-overview-year';

function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

const serviceSpecification: ServiceSpecification = {
  identification_number: 'A',
  name: 'Test-Pflichtenheft',
  short_name: 'TP',
  work_clothing_expenses: 0,
  work_days_expenses: { breakfast: 0, lunch: 0, dinner: 0 },
  paid_vacation_expenses: { breakfast: 0, lunch: 0, dinner: 0 },
  first_day_expenses: { breakfast: 0, lunch: 0, dinner: 0 },
  last_day_expenses: { breakfast: 0, lunch: 0, dinner: 0 },
  accommodation_expenses: 0,
  pocket_money: 0,
  active: true,
  formbricks_survey_id: null,
  site_id: null,
};

function renderServiceOverview(services: ServiceCollection[]): { div: HTMLDivElement } {
  const serviceStore = {
    entities: services,
    fetchByYear: jest.fn().mockResolvedValue(undefined),
  };
  const serviceSpecificationStore = {
    entities: [serviceSpecification],
    fetchAll: jest.fn().mockResolvedValue(undefined),
  };
  const mainStore = {
    intl,
    monthNames: moment.months(),
  };

  const div = document.createElement('div');
  const history = createMemoryHistory();

  ReactDOM.render(
    (
      <Provider serviceStore={serviceStore} serviceSpecificationStore={serviceSpecificationStore} mainStore={mainStore}>
        <RawIntlProvider value={intl}>
          <ThemeProvider theme={theme}>
            <Router history={history}>
              <ServiceOverview />
            </Router>
          </ThemeProvider>
        </RawIntlProvider>
      </Provider>
    ),
    div,
  );

  return { div };
}

describe('ServiceOverview regression: renders all weeks of a 53-week ISO year (ticket MAN541)', () => {
  const originalCookieYear = window.localStorage.getItem(cookieYearKey);

  afterEach(() => {
    if (originalCookieYear === null) {
      window.localStorage.removeItem(cookieYearKey);
    } else {
      window.localStorage.setItem(cookieYearKey, originalCookieYear);
    }
  });

  it('shows a week 53 column, not just up to week 52, when viewing 2026 (a 53-week ISO year)', async () => {
    window.localStorage.setItem(cookieYearKey, '2026');

    const service: ServiceCollection = {
      id: 1,
      beginning: '2026-01-01',
      ending: '2026-12-31',
      confirmation_date: '2026-01-01',
      service_specification: {
        identification_number: 'A',
        name: 'Test-Pflichtenheft',
        short_name: 'TP',
      },
      user: { id: 1, first_name: 'Max', last_name: 'Muster', zdp: 1 },
    };

    const { div } = renderServiceOverview([service]);

    // Let componentDidMount's fetchByYear()/fetchAll() promises (and their .then() chains,
    // which call getNrWeeks()/calculateServiceRows() synchronously - see
    // getNrWeeksOrdering.test.tsx) resolve and flush through to a render.
    await flushPromises();
    await flushPromises();

    const weekHeaderCells = Array.from(div.querySelectorAll('thead tr'))[1].querySelectorAll('td');
    const weekNumbers = Array.from(weekHeaderCells).map(td => td.textContent);

    expect(weekNumbers).toContain('53');
    expect(weekNumbers).not.toContain('54');
    expect(weekNumbers.length).toBe(53);

    ReactDOM.unmountComponentAtNode(div);
  });
});
