import { action, computed, observable } from 'mobx';
import moment from 'moment';
import { Payment, PaymentState } from '../types';
import { DomainStore } from './domainStore';
import { MainStore } from './mainStore';

export class PaymentStore extends DomainStore<Payment> {
  protected get entityName() {
    return {
      singular: this.mainStore.intl.formatMessage({
        id: 'store.paymentStore.payment.one',
        defaultMessage: 'Die Auszahlung',
      }),
      plural: this.mainStore.intl.formatMessage({
        id: 'store.paymentStore.payment.other',
        defaultMessage: 'Die Auszahlungen',
      }),
    };
  }

  @computed
  get entities(): Payment[] {
    return this.payments;
  }

  @computed
  get entity(): Payment | undefined {
    return this.payment;
  }

  set entity(payment: Payment | undefined) {
    this.payment = payment;
  }

  get paymentsInProgress() {
    return this.payments.filter(payment => payment.state === PaymentState.payment_in_progress);
  }

  get paidPayments() {
    return this.payments.filter(payment => payment.state === PaymentState.paid);
  }

  static convertPaymentTimestamp(timestamp: number) {
    return moment(timestamp * 1000);
  }

  @observable
  payments: Payment[] = [];

  @observable
  payment?: Payment;

  protected entityURL = '/payments/';
  protected entitiesURL = '/payments/';

  constructor(mainStore: MainStore) {
    super(mainStore);
  }

  async createPayment() {
    try {
      const res = await this.mainStore.api.post<Payment>('/payments');
      if (this.payments) {
        this.payments.push(res.data);
      }
      this.mainStore.displaySuccess(
        this.mainStore.intl.formatMessage(
          {
            id: 'store.created',
            defaultMessage: '{entityNameSingular} wurde erstellt.',
          },
          { entityNameSingular: this.entityName.singular },
        ),
      );
    } catch (e) {
      this.mainStore.displayError(
        DomainStore.buildErrorMessage(e, this.mainStore.intl.formatMessage(
          {
            id: 'store.not_created',
            defaultMessage: '{entityNameSingular} konnte nicht erstellt werden wurde erstellt.',
          },
          { entityNameSingular: this.entityName.singular },
        )),
      );
    }
  }

  async confirmPayment(paymentTimestamp?: number) {
    try {
      const timestamp = paymentTimestamp || this.payment!.payment_timestamp;
      const res = await this.mainStore.api.put<Payment>(`/payments/${timestamp}/confirm`);
      this.payment = res.data;
      this.mainStore.displaySuccess(
        this.mainStore.intl.formatMessage(
          {
            id: 'store.paymentStore.confirmed',
            defaultMessage: '{entityNameSingular} wurde bestätigt!',
          },
          { entityNameSingular: this.entityName.singular },
        ),
      );
    } catch (e) {
      this.mainStore.displayError(
        DomainStore.buildErrorMessage(e, this.mainStore.intl.formatMessage(
          {
            id: 'store.paymentStore.not_confirmed',
            defaultMessage: '{entityNameSingular} konnte nicht bestätigt werden',
          },
          { entityNameSingular: this.entityName.singular },
        )),
      );
    }
  }

  async cancelPayment(paymentTimestamp?: number) {
    try {
      const timestamp = paymentTimestamp || this.payment!.payment_timestamp;
      await this.mainStore.api.delete(`/payments/${timestamp}`);
      this.mainStore.displaySuccess(
        this.mainStore.intl.formatMessage(
          {
            id: 'store.paymentStore.cancelled',
            defaultMessage: '{entityNameSingular} wurde abgebrochen!',
          },
          { entityNameSingular: this.entityName.singular },
        ),
      );
    } catch (e) {
      this.mainStore.displayError(
        DomainStore.buildErrorMessage(e, this.mainStore.intl.formatMessage(
          {
            id: 'store.paymentStore.not_cancelled',
            defaultMessage: '{entityNameSingular} konnte nicht abgebrochen werden',
          },
          { entityNameSingular: this.entityName.singular },
        )),
      );
    }
  }

  @action
  async fetchAllWithYearDelta(delta: number) {
    try {
      const res = await this.mainStore.api.get<Payment[]>(`/payments?filter[year_delta]=${delta}`);
      this.payments = [...this.payments, ...res.data];
    } catch (e) {
      this.mainStore.displayError(
        DomainStore.buildErrorMessage(e, this.mainStore.intl.formatMessage(
          {
            id: 'store.domainStore.not_loaded.other',
            defaultMessage: '{entityNamePlural} konnten nicht geladen werden.',
          },
          { entityNamePlural: this.entityName.plural },
        )),
      );
      // tslint:disable-next-line:no-console
      console.error(e);
      throw e;
    }
  }
}
