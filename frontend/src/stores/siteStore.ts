import { action, computed, observable } from 'mobx';
import { Site } from '../types';
import { DomainStore } from './domainStore';

const buildFormData = (site: Site) => {
  const formData = new FormData();
  formData.append('site[name]', site.name);
  formData.append('site[language]', site.language);
  if (site.terms_pdf) {
    formData.append('site[terms_pdf]', site.terms_pdf);
  }
  return formData;
};

export class SiteStore extends DomainStore<Site> {
  protected get entityName() {
    return {
      singular: this.mainStore.intl.formatMessage({
        id: 'store.siteStore.site.one',
        defaultMessage: 'Der Standort',
      }),
      plural: this.mainStore.intl.formatMessage({
        id: 'store.siteStore.site.other',
        defaultMessage: 'Die Standorte',
      }),
    };
  }

  @computed
  get entities(): Site[] {
    return this.sites;
  }

  set entities(entities: Site[]) {
    this.sites = entities;
  }

  @observable
  sites: Site[] = [];

  protected entitiesURL = '/sites/';
  protected entityURL = '/sites/';

  @action
  protected async doPost(site: Site) {
    const response = await this.mainStore.api.post<Site>(this.entitiesURL, buildFormData(site));
    this.sites.unshift(response.data);
  }

  @action
  protected async doPut(site: Site) {
    const response = await this.mainStore.api.put<Site>(this.entitiesURL + site.id, buildFormData(site));
    const index = this.sites.findIndex(existing => existing.id === site.id);
    if (index >= 0) {
      this.sites[index] = response.data;
    }
  }
}
