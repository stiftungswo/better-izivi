import { History } from 'history';
import { action, autorun, computed, observable, reaction } from 'mobx';
import moment from 'moment';
import 'moment/locale/de';
import 'moment/locale/fr';
import { createIntl, createIntlCache, RawIntlProvider } from 'react-intl';
import momentLocalizer from 'react-widgets-moment';
import messagesDe from '../locales/messages.de.json';
import messagesEn from '../locales/messages.en.json';
import messagesFr from '../locales/messages.fr.json';
import { Locale } from '../types';
import { Formatter } from '../utilities/formatter';
import { buildURL } from '../utilities/helpers';
import {
  displayError,
  displaySuccess,
  displayWarning,
} from '../utilities/notification';
import { ApiStore, baseUrl } from './apiStore';

const cache = createIntlCache();

const KEY_LOCALE = 'izivi_Locale';

const germanLocale = 'de';
const frenchLocale = 'fr';
// const englishLocale = "en";

export const messages: { [locale in Locale]: any } = {
  [germanLocale]: messagesDe,
  [frenchLocale]: messagesFr,
  // [englishLocale]: messagesEn
};

export const languages = {
  [germanLocale]: 'Deutsch',
  [frenchLocale]: 'Français (Beta)',
  // [englishLocale]: "English"
};

export const defaultLocale = germanLocale;

export class MainStore {
  get api() {
    return this.apiStore.api;
  }

  @computed
  get intl() {
    return createIntl(
      {
        locale: this.currentLocale,
        messages: messages[this.currentLocale],
      },
      cache,
    );
  }

  get locale() {
    return this.currentLocale;
  }

  set locale(locale: Locale) {
    this.currentLocale = locale;
    localStorage.setItem(KEY_LOCALE, locale);
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
  monthNames: string[] = moment.months();

  // --- formatting
  formatDate = this.formatter.formatDate;
  formatDuration = this.formatter.formatDuration;
  formatCurrency = this.formatter.formatCurrency;
  trimString = this.formatter.trimString;

  // --- notifications
  displayWarning = displayWarning;
  displaySuccess = displaySuccess;
  displayError = displayError;

  @observable
  private currentLocale: Locale;

  constructor(
    private apiStore: ApiStore,
    readonly formatter: Formatter,
    private history: History,
  ) {
    autorun(() => {
      moment.locale(this.currentLocale);
      this.monthNames = moment.months();
      this.apiStore.setLanguageForApi(this.currentLocale);
    });

    this.currentLocale  = localStorage.getItem(KEY_LOCALE) as Locale || defaultLocale;
  }

  // --- routing / navigation
  @action
  navigateTo(path: string): void {
    this.history.push(path);
  }

  apiURL(
    path: string,
    params: object = {},
    includeAuth: boolean = true,
  ): string {
    return buildURL(baseUrl + '/' + path, {
      ...params,
      token: includeAuth ? this.apiStore.rawToken : undefined,
    });
  }

  isAdmin() {
    return this.apiStore.isAdmin;
  }
}
