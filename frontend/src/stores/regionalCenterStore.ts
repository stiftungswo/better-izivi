import { computed, observable } from 'mobx';
import { RegionalCenter } from '../types';
import { DomainStore } from './domainStore';

export class RegionalCenterStore extends DomainStore<RegionalCenter> {
  protected get entityName() {
    return {
      singular: this.mainStore.intl.formatMessage({
        id: 'izivi.frontend.store.regionalCenterStore.regional_center.one',
        defaultMessage: 'Das Regionalzentrum',
      }),
      plural: this.mainStore.intl.formatMessage({
        id: 'izivi.frontend.store.regionalCenterStore.regional_center.other',
        defaultMessage: 'Die Regionalzentren',
      }),
    };
  }

  @computed
  get entities(): RegionalCenter[] {
    return this.regionalCenters;
  }

  set entities(entities: RegionalCenter[]) {
    this.regionalCenters = entities;
  }

  @observable
  regionalCenters: RegionalCenter[] = [];

  protected entitiesURL = '/regional_centers/';
}
