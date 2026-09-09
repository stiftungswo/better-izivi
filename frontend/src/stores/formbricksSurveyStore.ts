import { computed, observable } from 'mobx';
import { FormbricksSurvey } from '../types';
import { DomainStore } from './domainStore';

export class FormbricksSurveyStore extends DomainStore<FormbricksSurvey> {
  protected get entityName() {
    return {
      singular: this.mainStore.intl.formatMessage({
        id: 'store.formbricksSurveyStore.formbricks_survey.one',
        defaultMessage: 'Die Formbricks-Umfrage',
      }),
      plural: this.mainStore.intl.formatMessage({
        id: 'store.formbricksSurveyStore.formbricks_survey.other',
        defaultMessage: 'Die Formbricks-Umfragen',
      }),
    };
  }

  @computed
  get entities(): FormbricksSurvey[] {
    return this.formbricksSurveys;
  }

  set entities(entities: FormbricksSurvey[]) {
    this.formbricksSurveys = entities;
  }

  @observable
  formbricksSurveys: FormbricksSurvey[] = [];

  protected entitiesURL = '/formbricks_surveys/';
}
