import { action, computed, observable } from 'mobx';
import { Service, ServiceCollection } from '../types';
import { DomainStore } from './domainStore';
import { MainStore } from './mainStore';

export class ServiceStore extends DomainStore<Service, ServiceCollection> {
  protected get entityName() {
    return {
      singular: 'Der Zivildiensteinsatz',
      plural: 'Die Zivildiensteinsätze',
    };
  }

  @computed
  get entities(): ServiceCollection[] {
    return this.services;
  }

  set entities(entities: ServiceCollection[]) {
    this.services = entities;
  }

  @computed
  get entity(): Service | undefined {
    return this.service;
  }

  set entity(service: Service | undefined) {
    this.service = service;
  }

  @observable
  services: ServiceCollection[] = [];

  @observable
  service?: Service;

  protected entitiesURL = '/services/';
  protected entityURL = '/services/';

  constructor(mainStore: MainStore) {
    super(mainStore);
  }

  @action
  async fetchByYear(year: string) {
    const res = await this.mainStore.api.get<ServiceCollection[]>('/services/?year=' + year);
    this.services = res.data;
  }

  async calcEligibleDays(beginning: string, ending: string) {
    const response = await this.mainStore.api.get<EligibleDays>('/services/calculate_service_days?beginning=' + beginning + '&ending=' + ending);
    return response.data.result;
  }

  async calcPossibleEndDate(beginning: string, service_days: number) {
    const response = await this.mainStore.api.get<PossibleEndDate>('/services/calculate_ending?beginning=' + beginning + '&service_days=' + service_days);
    return response.data.result;
  }

  @action
  async doPutDraft(id: number) {
    // TODO: Adapt to normal PUT
    const response = await this.mainStore.api.get<Service>('/services/' + id + '/draft');
    return response.data;
  }

  // @action
  // public async doFetchOne(id: number) {
  //   const response = await this.mainStore.api.get<Service>('/services/' + id);
  //   this.service = response.data;
  // }

  @action
  protected async doPost(service: Service) {
    // Todo: Implement
    const response = await this.mainStore.api.post<ServiceCollection[]>('/services', { service });
    this.services = response.data;
  }

  @action
  protected async doPut(service: Service) {
    // Todo: Implement
    const response = await this.mainStore.api.put<ServiceCollection[]>('/services/' + service.id, service);
    this.services = response.data;
  }
}

interface EligibleDays {
  result: number;
}

interface PossibleEndDate {
  result: string;
}
