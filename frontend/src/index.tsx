// tslint:disable:no-console
import * as Sentry from '@sentry/browser';
import createBrowserHistory from 'history/createBrowserHistory';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ThemeProvider } from 'react-jss';
import { Router } from 'react-router';
import momentLocalizer from 'react-widgets-moment';
import App from './App';
import { theme } from './layout/theme';
import { StoreConnectedIntlProvider } from './utilities/StoreConnectedIntlProvider';
import { StoreProvider } from './utilities/StoreProvider';

const browserHistory = createBrowserHistory();
const sentryDSN = 'SENTRY_DSN'; // this value will be replaced by a build script
const sentryEnvironment = 'SENTRY_ENVIRONMENT';

const options: Sentry.BrowserOptions = {};

if (sentryEnvironment !== 'SENTRY_ENVIRONMENT') {
  options.environment = sentryEnvironment;
}

if (sentryDSN.startsWith('https')) {
  options.dsn = sentryDSN;
  Sentry.init(options);
}

momentLocalizer();

ReactDOM.render(
  <StoreProvider history={browserHistory}>
    <StoreConnectedIntlProvider>
      <ThemeProvider theme={theme}>
        <Router history={browserHistory}>
          <App/>
        </Router>
      </ThemeProvider>
    </StoreConnectedIntlProvider>
  </StoreProvider>
    ,
  document.getElementById('root') as HTMLElement,
);
// registerServiceWorker();
