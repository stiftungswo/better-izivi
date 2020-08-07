import { History } from 'history';
import { action, autorun, computed, observable, reaction } from 'mobx';
import moment from 'moment';
import { createIntl, createIntlCache, RawIntlProvider } from 'react-intl';
import momentLocalizer from 'react-widgets-moment';
import messagesDe from '../messages.de-CH.json';
import messagesFr from '../messages.fr-CH.json';
import { Locale } from '../types';
import { Formatter } from '../utilities/formatter';
import { buildURL } from '../utilities/helpers';
import { displayError, displaySuccess, displayWarning } from '../utilities/notification';
import { ApiStore, baseUrl } from './apiStore';

const cache = createIntlCache();

const germanLocale = 'de-CH';
const frenchLocale = 'fr-CH';

export const messages: { [locale in Locale]: any } = {
  [germanLocale]: messagesDe,
  [frenchLocale]: messagesFr,
};

export const languages = {
  [germanLocale]: 'Deutsch',
  [frenchLocale]: 'Français',
};

export class MainStore {
  get api() {
    return this.apiStore.api;
  }

  static validateIBAN(value: string) {
    const regex = new RegExp('^CH\\d{2}\\s?(\\w{4}\\s?){4,7}\\w{0,2}$', 'g');
    return regex.test(value);
  }

  @observable
  navOpen = false;

  @observable
  showArchived = false;

  @observable
  locale: Locale = 'de-CH';

  @observable
  monthNames: string[] = moment.months();

  @computed
  get intl() {
    return createIntl({
      locale: this.locale,
      messages: messages[this.locale],
    },
      cache);
  }

  // --- formatting
  formatDate = this.formatter.formatDate;
  formatDuration = this.formatter.formatDuration;
  formatCurrency = this.formatter.formatCurrency;
  trimString = this.formatter.trimString;

  // --- notifications
  displayWarning = displayWarning;
  displaySuccess = displaySuccess;
  displayError = displayError;

  constructor(private apiStore: ApiStore, readonly formatter: Formatter, private history: History) {
    autorun(() => {
      moment.locale(this.locale);
      this.monthNames = moment.months();
    });
}

// --- routing / navigation
  @action
navigateTo(path: string): void {
  this.history.push(path);
}

  apiURL(path: string, params: object = {}, includeAuth: boolean = true): string {
  return buildURL(baseUrl + '/' + path, {
    ...params,
    token: includeAuth ? this.apiStore.rawToken : undefined,
  });
}

  isAdmin() {
  return this.apiStore.isAdmin;
}
}
