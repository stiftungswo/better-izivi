// tslint:disable:no-console
import * as _ from 'lodash';
import { action, computed, observable } from 'mobx';
import { ExpenseSheet, ExpenseSheetHints, ExpenseSheetListing, ExpenseSheetState } from '../types';
import { stateTranslation } from '../utilities/helpers';
import { DomainStore } from './domainStore';
import { MainStore } from './mainStore';

export class ExpenseSheetStore extends DomainStore<ExpenseSheet, ExpenseSheetListing> {
  protected get entityName() {
    return {
      singular: this.mainStore.intl.formatMessage({
        id: 'store.expenseSheetStore.expense_sheet.one',
        defaultMessage: 'Das Spesenblatt',
      }),
      plural: this.mainStore.intl.formatMessage({
        id: 'store.expenseSheetStore.expense_sheet.other',
        defaultMessage: 'Die Spesenblätter',
      }),
    };
  }

  @computed
  get entities(): ExpenseSheetListing[] {
    return this.expenseSheets;
  }

  set entities(entities: ExpenseSheetListing[]) {
    this.expenseSheets = entities;
  }

  @computed
  get entity(): ExpenseSheet | undefined {
    return this.expenseSheet;
  }

  set entity(expenseSheet: ExpenseSheet | undefined) {
    this.expenseSheet = expenseSheet;
  }

  @observable
  toBePaidExpenseSheets: ExpenseSheetListing[] = [];

  @observable
  expenseSheets: ExpenseSheetListing[] = [];

  @observable
  expenseSheet?: ExpenseSheet;

  @observable
  buttonDeactive: boolean;

  @observable
  totalSum: string;

  hints?: ExpenseSheetHints;

  protected entityURL = '/expense_sheets/';
  protected entitiesURL = '/expense_sheets/';

  constructor(mainStore: MainStore) {
    super(mainStore);
    this.buttonDeactive = false;
    this.totalSum = '';
  }

  @action
  async fetchToBePaidAll(): Promise<void> {
    try {
      this.toBePaidExpenseSheets = [];
      const response = await this.mainStore.api.get<ExpenseSheetListing[]>('/expense_sheets', { params: { filter: 'ready_for_payment'  } });
      this.toBePaidExpenseSheets = response.data;
    } catch (e) {
      this.mainStore.displayError(
        this.mainStore.intl.formatMessage(
          {
            id: 'store.domainStore.not_loaded.other',
            defaultMessage: '{entityNamePlural} konnten nicht geladen werden.',
          },
          { entityNamePlural: this.entityName.plural },
        ));
      console.error(e);
      throw e;
    }
  }

  @action
  async putState(state: ExpenseSheetState, id?: number): Promise<void> {
    id = id || this.expenseSheet!.id;
    if (!id) {
      throw new Error('Expense sheet has no id');
    }

    try {
      const res = await this.mainStore.api.put<ExpenseSheet>('/expense_sheets/' + id, { expense_sheet: { state } });
      this.mainStore.displaySuccess(
        this.mainStore.intl.formatMessage(
          {
            id: 'store.expenseSheetStore.state_changed',
            defaultMessage: '{entityNameSingular} wurde auf {state} geändert.',
          },
          {
            entityNameSingular: this.entityName.singular,
            state: stateTranslation(state),
          },
        ));
      if (this.expenseSheet) {
        this.expenseSheet = res.data;
      }
    } catch (e) {
      this.mainStore.displayError(
        DomainStore.buildErrorMessage(e, this.mainStore.intl.formatMessage(
          {
            id: 'store.expenseSheetStore.state_changed',
            defaultMessage: '{entityNameSingular} wurde auf {state} geändert.',
          },
          {
            entityNameSingular: this.entityName.singular,
            state: stateTranslation(state),
          },
        )),
      );
      console.error(e);
      throw e;
    }
  }

  async fetchHints(expenseSheetId: number) {
    try {
      const response = await this.mainStore.api.get<ExpenseSheetHints>(`/expense_sheets/${expenseSheetId}/hints`);
      this.hints = response.data;
    } catch (e) {
      this.mainStore.displayError(
        this.mainStore.intl.formatMessage(
          {
            id: 'store.expenseSheetStore.expense_hints_not_loaded',
            defaultMessage: 'Spesenvorschläge konnten nicht geladen werden',
          },
        ));
      console.error(e);
      throw e;
    }
  }

  @action
  async createAdditional(serviceId: number) {
    const res = await this.mainStore.api.post<ExpenseSheet>('/expense_sheets/', { service_id: serviceId });
    this.mainStore.displaySuccess(
      this.mainStore.intl.formatMessage(
        {
          id: 'store.created',
          defaultMessage: '{entityNameSingular} wurde erstellt.',
        },
        { entityNameSingular: this.entityName.singular },
      ));
  }

  async doFetchPage(params: object = {}): Promise<void> {
    try {
      const res = await this.mainStore.api.get<ExpenseSheetListing[]>('/expense_sheets', { params: { ...params } });
      let items = 'items' // to shut up tslint (object access via string literals is disallowed)
      if (res.data.length === parseInt(params[items], 10)) {
          this.buttonDeactive = true;
      }
      if (res.data.length === (parseInt(params[items], 10) + 1)) {
          this.buttonDeactive = false;
          res.data.splice(-1, 1);
      }
      if (res.data.length < parseInt(params[items], 10)) {
          this.buttonDeactive = true;
      }
      this.expenseSheets = res.data;
    } catch (e) {
      this.mainStore.displayError(
        this.mainStore.intl.formatMessage(
          {
            id: 'store.domainStore.not_loaded.other',
            defaultMessage: '{entityNamePlural} konnten nicht geladen werden.',
          },
          { entityNamePlural: this.entityName.plural },
        ));
      console.error(e);
      throw e;
    }
  }

  calcsum(arr: any[]): number {
    return _.sumBy(arr, object => object) / 100;
  }

  async doFetchTotal(params: object = {}) {
    try {
      let listTotal = [];
      const res = await this.mainStore.api.get('/expenses_sheet_sum', { params: { ...params } });

      for (let i = 0; i < res.data.length; i++) {
        listTotal[i] = res.data[i].total;
      }
      this.totalSum = this.calcsum(listTotal).toFixed(2);
    } catch (e) {
      this.mainStore.displayError(
        this.mainStore.intl.formatMessage(
          {
            id: '"store.domainStore.error"',
            defaultMessage: 'Fehler',
          },
          { entityNamePlural: this.entityName.plural },
        ));
      console.error(e);
      throw e;
    }
    }
}
