import { action, computed, observable } from 'mobx';
import { ServiceSpecification } from '../types';
import { DomainStore } from './domainStore';

export class ServiceSpecificationStore extends DomainStore<ServiceSpecification> {
  protected get entityName() {
    return {
      singular: this.mainStore.intl.formatMessage({
        id: 'store.serviceSpecificationStore.service_specification.one',
        defaultMessage: 'Das Pflichtenheft',
      }),
      plural: this.mainStore.intl.formatMessage({
        id: 'store.serviceSpecificationStore.service_specification.other',
        defaultMessage: 'Die Pflichtenhefte',
      }),
    };
  }

  @computed
  get entities(): ServiceSpecification[] {
    return this.serviceSpecifications;
  }

  set entities(entities: ServiceSpecification[]) {
    this.serviceSpecifications = entities;
  }

  @computed
  get entity(): ServiceSpecification | undefined {
    return this.serviceSpecification;
  }

  set entity(holiday: ServiceSpecification | undefined) {
    this.serviceSpecification = holiday;
  }

  @observable
  serviceSpecifications: ServiceSpecification[] = [];

  @observable
  serviceSpecification?: ServiceSpecification;

  protected entitiesURL = '/service_specifications/';
  protected entityURL = '/service_specifications/';

  @action
  protected async doPost(serviceSpecification: ServiceSpecification) {
    const response = await this.mainStore.api.post<ServiceSpecification>(this.entitiesURL, serviceSpecification);
    this.serviceSpecifications.unshift(response.data);
  }
}
