import createMemoryHistory from 'history/createMemoryHistory';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ThemeProvider } from 'react-jss';
import { Router } from 'react-router';
import App from './App';
import { theme } from './layout/theme';
import { StoreConnectedIntlProvider } from './utilities/StoreConnectedIntlProvider';
import { StoreProvider } from './utilities/StoreProvider';

it('renders without crashing', () => {
  const history = createMemoryHistory();
  const div = document.createElement('div');
  ReactDOM.render(
    <StoreProvider history={history}>
      <StoreConnectedIntlProvider>
        <ThemeProvider theme={theme}>
          <Router history={history}>
            <App/>
          </Router>
        </ThemeProvider>
      </StoreConnectedIntlProvider>
    </StoreProvider>,
    div,
  );
  ReactDOM.unmountComponentAtNode(div);
});
